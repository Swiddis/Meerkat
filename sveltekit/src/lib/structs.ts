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
    project?: string,
    author?: string,
    timestamp?: string,
    assigned_to?: string,
    status: Status,
    resolution?: string,
    type: Type,
    severity: number,
    priority: number,
    title: string,
    description: string,
    reproduction_steps?: string,
    expected_result?: string,
}

export interface Project {
    id?: string,
    name: string,
    admin: string,
    users: [string]
}