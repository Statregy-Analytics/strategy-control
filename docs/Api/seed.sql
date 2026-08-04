-- Strategy Analytics API seed data for local/manual endpoint testing.
--
-- Target database: PostgreSQL.
-- Prerequisite: run EF Core migrations first so schemas/tables exist.
--
-- Seeded credentials used by docs/http collections:
--   admin@example.com  / ChangeMe123!
--   client@example.com / ChangeMe123!

BEGIN;

INSERT INTO platform.workspaces (
    "Id",
    "Code",
    "Name",
    "Status",
    "CreatedAtUtc",
    "UpdatedAtUtc"
)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'default',
    'Default Workspace',
    'Active',
    TIMESTAMPTZ '2026-06-01 00:00:00+00',
    NULL
)
ON CONFLICT ("Id") DO UPDATE
SET
    "Code" = EXCLUDED."Code",
    "Name" = EXCLUDED."Name",
    "Status" = EXCLUDED."Status";

INSERT INTO identity.roles (
    "Id",
    "Name",
    "NormalizedName",
    "Description",
    "CreatedAtUtc"
)
VALUES
    ('1f99fe4e-b55b-4694-9b4f-2f5bbf21c2b7', 'Admin', 'ADMIN', 'Administrative access.', TIMESTAMPTZ '1970-01-01 00:00:00+00'),
    ('dd465a7f-2f74-41cd-bd2b-f318ba841577', 'Operador', 'OPERADOR', 'Operational access.', TIMESTAMPTZ '1970-01-01 00:00:00+00'),
    ('8794416d-8ce9-44e1-8cdb-8434d67d6282', 'Cliente', 'CLIENTE', 'Customer access.', TIMESTAMPTZ '1970-01-01 00:00:00+00'),
    ('326572ac-fb34-455f-bfa7-587b58b61aa5', 'System', 'SYSTEM', 'Technical system access.', TIMESTAMPTZ '1970-01-01 00:00:00+00')
ON CONFLICT ("Id") DO UPDATE
SET
    "Name" = EXCLUDED."Name",
    "NormalizedName" = EXCLUDED."NormalizedName",
    "Description" = EXCLUDED."Description";

INSERT INTO identity.users (
    "Id",
    "WorkspaceId",
    "Name",
    "Email",
    "NormalizedEmail",
    "PasswordHash",
    "Status",
    "LastLoginAtUtc",
    "CreatedAtUtc",
    "UpdatedAtUtc",
    "CreatedBy",
    "UpdatedBy"
)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Local Admin',
        'admin@example.com',
        'ADMIN@EXAMPLE.COM',
        $hash$PBKDF2-SHA256$210000$U3RyYXRlZ3lBZG1pbjAwMQ==$36rENNmcpIZI5XyuTRdi4qTLBrKiXoXSQTx9nTcTsdg=$hash$,
        'Active',
        NULL,
        TIMESTAMPTZ '2026-06-01 00:00:00+00',
        NULL,
        NULL,
        NULL
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Local Client',
        'client@example.com',
        'CLIENT@EXAMPLE.COM',
        $hash$PBKDF2-SHA256$210000$U3RyYXRlZ3lDbGllbnQwMQ==$rnSk9+XT/15/xOwRY10uXp7um6F5n68lRZjqBAv6Onk=$hash$,
        'Active',
        NULL,
        TIMESTAMPTZ '2026-06-01 00:00:00+00',
        NULL,
        NULL,
        NULL
    )
ON CONFLICT ("NormalizedEmail") DO UPDATE
SET
    "WorkspaceId" = EXCLUDED."WorkspaceId",
    "Name" = EXCLUDED."Name",
    "Email" = EXCLUDED."Email",
    "PasswordHash" = EXCLUDED."PasswordHash",
    "Status" = EXCLUDED."Status",
    "UpdatedAtUtc" = NOW();

INSERT INTO identity.user_roles (
    "UserId",
    "RoleId",
    "CreatedAtUtc"
)
SELECT
    users."Id",
    roles."Id",
    TIMESTAMPTZ '2026-06-01 00:00:00+00'
FROM (
    VALUES
        ('ADMIN@EXAMPLE.COM', 'ADMIN'),
        ('CLIENT@EXAMPLE.COM', 'CLIENTE')
) AS seed("NormalizedEmail", "NormalizedRole")
JOIN identity.users users
    ON users."NormalizedEmail" = seed."NormalizedEmail"
JOIN identity.roles roles
    ON roles."NormalizedName" = seed."NormalizedRole"
ON CONFLICT ("UserId", "RoleId") DO NOTHING;

INSERT INTO identity.user_workspace_access (
    "UserId",
    "WorkspaceId",
    "Status",
    "CreatedAtUtc"
)
SELECT
    users."Id",
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Active',
    TIMESTAMPTZ '2026-06-01 00:00:00+00'
FROM identity.users users
WHERE users."NormalizedEmail" IN ('ADMIN@EXAMPLE.COM', 'CLIENT@EXAMPLE.COM')
ON CONFLICT ("UserId", "WorkspaceId") DO UPDATE
SET "Status" = EXCLUDED."Status";

COMMIT;