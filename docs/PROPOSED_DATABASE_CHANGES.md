# Proposed Database Changes

All changes maintain 100% backward compatibility with existing tables while introducing the first-class entities required for an enterprise Customer Operations Platform.

---

## 1. New Tables to Add

### 1.1 `customers` (Canonical Customer Entity)
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    primary_email VARCHAR(255),
    primary_phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, BLOCKED, VIP
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_customers_tenant ON customers(tenant_id);
CREATE INDEX ix_customers_email ON customers(tenant_id, primary_email);
CREATE INDEX ix_customers_phone ON customers(tenant_id, primary_phone);
```

### 1.2 `customer_identities` (Multi-Channel Identity Mapping)
```sql
CREATE TABLE customer_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL, -- PHONE, EMAIL, WEB_SESSION, STRIPE_CUSTOMER, SHOPIFY_ID
    identifier VARCHAR(255) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PROBABLE', -- KNOWN, PROBABLE, UNKNOWN
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_channel_identifier UNIQUE (tenant_id, channel, identifier)
);
CREATE INDEX ix_identities_customer ON customer_identities(customer_id);
```

### 1.3 `cases` (First-Class Operations Cases)
```sql
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- BILLING_DISPUTE, TECH_SUPPORT, SCHEDULING, GENERAL
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, WAITING_APPROVAL, ESCALATED, RESOLVED, CLOSED
    assigned_agent VARCHAR(100) NOT NULL DEFAULT 'supervisor',
    human_owner_id UUID REFERENCES clients(id),
    current_workflow VARCHAR(100),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX ix_cases_tenant_status ON cases(tenant_id, status);
CREATE INDEX ix_cases_customer ON cases(customer_id);
```

### 1.4 `case_events` (Case Timeline & Audit History)
```sql
CREATE TABLE case_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    actor_type VARCHAR(50) NOT NULL, -- AI_AGENT, HUMAN_OPERATOR, CUSTOMER, SYSTEM
    actor_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- INTENT_DETECTED, TOOL_PROPOSED, APPROVAL_REQUESTED, APPROVAL_GRANTED, ACTION_EXECUTED, STATUS_CHANGED
    description TEXT NOT NULL,
    event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    trace_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_case_events_case ON case_events(case_id, created_at ASC);
```

### 1.5 `approval_requests` (Human-in-the-Loop Queue)
```sql
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- ISSUE_REFUND, CANCEL_SUBSCRIPTION, APPLY_DISCOUNT
    proposed_payload JSONB NOT NULL,
    reason TEXT NOT NULL,
    policy_rule_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, EXPIRED
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    workflow_checkpoint_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_approvals_tenant_status ON approval_requests(tenant_id, status);
```

### 1.6 `audit_events` (Immutable Compliance Log)
```sql
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    actor_type VARCHAR(50) NOT NULL, -- AI_AGENT, HUMAN_AGENT, SYSTEM, CUSTOMER
    actor_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    authorization_result VARCHAR(50) NOT NULL DEFAULT 'ALLOWED', -- ALLOWED, DENIED, FLAGGED
    idempotency_key VARCHAR(128),
    trace_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_audit_tenant_action ON audit_events(tenant_id, action, created_at DESC);
CREATE INDEX ix_audit_idempotency ON audit_events(idempotency_key);
```

### 1.7 `idempotency_records` (Duplicate Execution Protection)
```sql
CREATE TABLE idempotency_records (
    idempotency_key VARCHAR(128) PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    operation_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, FAILED
    result_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX ix_idempotency_expires ON idempotency_records(expires_at);
```

---

## 2. Preserved Existing Tables
All existing tables (`clients`, `agent_configs`, `calls`, `transcripts`, `leads`, `engagements`, `shopify_stores`, etc.) are 100% preserved. Existing `Lead` and `Call` records will seamlessly link to the new `Customer` records during Phase 1 migration.
