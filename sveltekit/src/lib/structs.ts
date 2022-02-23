export enum Status {
    open = "open",
    resolved = "resolved",
    closed = "closed"
}

export enum Type {
    bug = "bug",
    suggestion = "suggestion",
    todo = "todo"
}

export enum Resolution {
    fixed = "fixed",
    by_design = "by design",
    wont_fix = "won't fix",
    postponed = "postponed",
    duplicate = "duplicate",
    not_reproducible = "not reproducible"
}

export interface Ticket {
    project?: String,
    author?: String,
    timestamp?: String,
    assigned_to?: String,
    status: Status,
    resolution?: String,
    type: Type,
    severity: Number,
    priority: Number,
    title: String,
    description: String,
    reproduction_steps?: String,
    expected_result?: String,
};