"""Base Specialist Agent Specification & Authorization Boundaries.

Every specialist agent enforces:
1. Explicit responsibility scope.
2. Whitelist of allowed tools.
3. Blacklist of strictly prohibited tools.
4. Structured input and output schemas using Pydantic.
5. Deterministic authorization enforcement.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any
from pydantic import BaseModel, Field

from app.core.logging import get_logger
from app.orchestration.langgraph.state import CustomerOperationState

logger = get_logger(__name__)


class ActionProposal(BaseModel):
    """Structured action proposed by an LLM agent prior to authorization."""
    tool_name: str = Field(..., description="Target registered tool name")
    parameters: dict[str, Any] = Field(default_factory=dict, description="Validated tool arguments")
    reasoning: str = Field(..., description="Agent justification for proposing this action")
    requires_approval: bool = Field(False, description="Flagged if action exceeds autonomous risk limits")


class AgentExecutionOutput(BaseModel):
    """Structured output contract returned by every specialist agent."""
    agent_id: str
    response_message: str
    proposed_actions: list[ActionProposal] = Field(default_factory=list)
    escalate_to_human: bool = False
    escalation_reason: str | None = None
    confidence: float = 1.0
    updated_context: dict[str, Any] = Field(default_factory=dict)


class ToolAccessDeniedError(PermissionError):
    """Raised when an agent attempts to execute an unauthorized tool."""
    pass


class BaseSpecialistAgent(ABC):
    """Abstract base class for all specialist customer operations agents."""

    def __init__(
        self,
        agent_id: str,
        name: str,
        allowed_tools: set[str],
        prohibited_tools: set[str] | None = None,
    ):
        self.agent_id = agent_id
        self.name = name
        self.allowed_tools = allowed_tools
        self.prohibited_tools = prohibited_tools or set()

    def is_tool_authorized(self, tool_name: str) -> bool:
        """Enforce strict capability boundary."""
        if tool_name in self.prohibited_tools:
            logger.warning(
                f"[SECURITY] Agent '{self.agent_id}' explicitly prohibited from using tool '{tool_name}'"
            )
            return False
        return tool_name in self.allowed_tools

    def assert_tool_authorized(self, tool_name: str) -> None:
        """Assert tool authorization, raising ToolAccessDeniedError on boundary violation."""
        if not self.is_tool_authorized(tool_name):
            raise ToolAccessDeniedError(
                f"Agent '{self.agent_id}' is not authorized to execute tool '{tool_name}'. "
                f"Allowed tools: {list(self.allowed_tools)}"
            )

    @abstractmethod
    async def process(self, state: CustomerOperationState) -> AgentExecutionOutput:
        """Process workflow turn and return structured agent output."""
        pass
