"""Enterprise Tool Registry for Omniweb Contact Center.

Manages:
- Tool registration and discovery
- Schema validation via Pydantic
- Agent-level RBAC and tool permission allowlists
- Risk evaluation and Human-in-the-Loop triggers
- Execution timing and immutable audit trail logging
"""
from __future__ import annotations

import time
import uuid
from typing import Any

from pydantic import ValidationError

from app.core.logging import get_logger
from app.core.telemetry import MetricTracker, get_current_correlation
from app.tools.base import BaseTool, ToolResult, ToolRiskLevel

logger = get_logger(__name__)


class ToolPermissionDenied(Exception):
    """Raised when an agent attempts to invoke a tool outside its allowed boundaries."""
    pass


class ToolRegistry:
    """Central registry of executable enterprise tools."""

    def __init__(self):
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        """Register a tool instance."""
        if tool.name in self._tools:
            logger.warning(f"Overwriting existing tool registration: {tool.name}")
        self._tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name} [{tool.category.value}] (risk={tool.risk_level.value})")

    def get(self, name: str) -> BaseTool | None:
        return self._tools.get(name)

    def list_all(self) -> list[BaseTool]:
        return list(self._tools.values())

    def get_tools_for_agent(self, agent_name: str) -> list[BaseTool]:
        """Return all tools permitted for a specific specialist agent."""
        permitted: list[BaseTool] = []
        for tool in self._tools.values():
            # If no restrictions specified, tool is available to all, otherwise check allowlist
            if not tool.allowed_agents or agent_name in tool.allowed_agents or "all" in tool.allowed_agents:
                permitted.append(tool)
        return permitted

    def get_schemas_for_agent(self, agent_name: str) -> list[dict[str, Any]]:
        """Return LLM function calling schemas permitted for the given agent."""
        return [tool.get_json_schema() for tool in self.get_tools_for_agent(agent_name)]

    async def execute_tool(
        self,
        name: str,
        raw_params: dict[str, Any],
        *,
        tenant_id: str,
        agent_name: str,
        caller_id: str | None = None,
        context: dict[str, Any] | None = None,
        session: Any = None,
    ) -> ToolResult:
        """Validate, authorize, and execute a tool invocation through the 9-stage pipeline."""
        tool = self.get(name)
        if not tool:
            err_msg = f"Tool '{name}' is not registered in the system."
            logger.error(err_msg)
            return ToolResult(success=False, error=err_msg)

        from app.tools.pipeline import get_tool_pipeline
        pipeline = get_tool_pipeline()
        return await pipeline.execute(
            tool,
            raw_params,
            tenant_id=tenant_id,
            agent_name=agent_name,
            caller_id=caller_id,
            context=context,
            session=session,
        )


_tool_registry = ToolRegistry()


def get_tool_registry() -> ToolRegistry:
    """Singleton getter for the global tool registry."""
    return _tool_registry
