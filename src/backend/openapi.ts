export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "FinCred Demo API",
    version: "0.1.0",
    description:
      "Illustrative financial credibility prototype API. All users, payments, scores, and documents are fictional and synthetic. This API must not be used for real customer data or lending decisions.",
  },
  servers: [{ url: "/", description: "Current FinCred deployment" }],
  tags: [
    { name: "Authentication", description: "Session authentication and refresh rotation." },
    { name: "Transactions", description: "Synthetic payment record management." },
    { name: "Assessment", description: "Illustrative financial credibility assessment." },
    { name: "Consent", description: "Purpose-specific consumer consent." },
    { name: "Reports", description: "Immutable report snapshots." },
    { name: "Lender", description: "Consent-scoped lender applicant workflows." },
    { name: "Synthetic Data", description: "Fictional payment data generation jobs." },
    { name: "Administration", description: "Administrator-only operational controls." },
    { name: "System", description: "Health and API metadata." },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "fincred_session",
        description: "Short-lived HTTP-only access cookie issued by login or refresh.",
      },
      refreshCookie: {
        type: "apiKey",
        in: "cookie",
        name: "fincred_refresh",
        description: "HTTP-only rotating refresh cookie scoped to /api/auth.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string", example: "validation_error" },
              message: { type: "string" },
              fields: {
                type: "object",
                additionalProperties: { type: "string" },
              },
            },
          },
        },
      },
      PublicUser: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          fullName: { type: "string" },
          role: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          category: { type: "string", enum: ["rent", "electricity", "mobile"] },
          amount: { type: "number", example: 25000 },
          transactionDate: { type: "string", format: "date" },
          platform: { type: "string" },
          description: { type: "string" },
          metadata: { type: "object", additionalProperties: { type: "string" } },
          attachment: {
            nullable: true,
            type: "object",
            properties: {
              filename: { type: "string" },
              mimeType: { type: "string" },
              size: { type: "integer" },
              downloadUrl: { type: "string" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Assessment: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["completed", "insufficient_data"] },
          score: { type: ["integer", "null"], minimum: 0, maximum: 100 },
          maxScore: { type: "integer", example: 100 },
          band: { type: "string" },
          interpretation: { type: "string" },
          summary: { type: "string" },
          explanationFactors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                points: { type: "number" },
                maxPoints: { type: "number" },
                status: { type: "string", enum: ["strong", "moderate", "needs_data"] },
                detail: { type: "string" },
              },
            },
          },
          positiveIndicators: { type: "array", items: { type: "string" } },
          dataGaps: { type: "array", items: { type: "string" } },
          processedTransactions: { type: "integer" },
          dataCoverage: {
            type: "object",
            properties: {
              percentage: { type: "integer" },
              level: { type: "string" },
              components: { type: "array", items: { type: "object" } },
            },
          },
          categoryContributions: { type: "array", items: { type: "object" } },
          requirements: { type: "array", items: { type: "object" } },
          assessmentTimestamp: { type: "string", format: "date-time" },
          lookbackMonths: { type: "integer" },
          engine: { type: "object" },
          disclaimer: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Sign in with a fictional demo account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "consumer@fincred.demo" },
                  password: { type: "string", example: "Demo@123" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Demo session established." },
          "401": {
            description: "Invalid demo credentials.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          "422": {
            description: "Validation error.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Rotate the refresh token and issue a new access cookie",
        description:
          "Each refresh token is single-use. Reusing a rotated token revokes the entire token family and returns refresh_token_reused.",
        security: [{ refreshCookie: [] }],
        responses: {
          "200": { description: "New access and refresh cookies issued." },
          "401": { description: "Missing, expired, revoked, or reused refresh token." },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get the current demo user",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": { description: "Current demo user." },
          "401": { description: "No valid session." },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Revoke the refresh token and clear session cookies",
        security: [{ sessionCookie: [] }, { refreshCookie: [] }],
        responses: { "200": { description: "Session cookies cleared and refresh token revoked." } },
      },
    },
    "/api/auth/demo-accounts": {
      get: {
        tags: ["Authentication"],
        summary: "List the public fictional demo credentials",
        responses: { "200": { description: "Demo account list." } },
      },
    },
    "/api/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "List the current demo user's synthetic payments",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "category",
            in: "query",
            schema: { type: "string", enum: ["rent", "electricity", "mobile"] },
          },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 200 } },
        ],
        responses: {
          "200": { description: "Transaction list." },
          "401": { description: "No valid session." },
        },
      },
      post: {
        tags: ["Transactions"],
        summary: "Create a synthetic payment record",
        description:
          "Send multipart/form-data with common fields, a JSON metadata string, and an optional synthetic PDF/JPG/PNG attachment.",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: [
                  "category",
                  "amount",
                  "transaction_date",
                  "platform",
                  "description",
                  "metadata",
                ],
                properties: {
                  category: { type: "string", enum: ["rent", "electricity", "mobile"] },
                  amount: { type: "string", example: "25000.00" },
                  transaction_date: { type: "string", format: "date" },
                  platform: { type: "string" },
                  description: { type: "string" },
                  metadata: {
                    type: "string",
                    description: "JSON string of category-specific synthetic fields.",
                  },
                  attachment: {
                    type: "string",
                    format: "binary",
                    description: "Optional synthetic PDF/JPG/JPEG/PNG up to 5 MB.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Transaction created." },
          "401": { description: "No valid session." },
          "409": { description: "Duplicate transaction." },
          "422": { description: "Validation or attachment error." },
        },
      },
    },
    "/api/transactions/summary": {
      get: {
        tags: ["Transactions"],
        summary: "Get dashboard totals, category overview, recent activity, and readiness",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": { description: "Transaction summary." },
          "401": { description: "No valid session." },
        },
      },
    },
    "/api/transactions/{id}": {
      get: {
        tags: ["Transactions"],
        summary: "Retrieve one synthetic payment",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Transaction detail." },
          "404": { description: "Not found." },
        },
      },
    },
    "/api/transactions/{id}/attachment": {
      get: {
        tags: ["Transactions"],
        summary: "Download a synthetic payment attachment",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Attachment bytes." },
          "404": { description: "Attachment not found." },
        },
      },
    },
    "/api/assessment/generate": {
      post: {
        tags: ["Assessment"],
        summary: "Generate an illustrative financial credibility assessment",
        description:
          "Retrieves the current demo user's synthetic transactions, runs the configured assessment engine, and returns an illustrative scorecard. The provisional reference engine is clearly identified in the response.",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  lookback_months: { type: "integer", minimum: 1, maximum: 24, default: 6 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Assessment result, including insufficient-data state.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Assessment" } },
            },
          },
          "401": { description: "No valid session." },
          "422": { description: "Invalid assessment request." },
          "503": { description: "Assessment engine failure." },
        },
      },
    },
    "/api/consents": {
      get: {
        tags: ["Consent"],
        summary: "List the signed-in consumer's consent records",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": { description: "Consent records with lender and scope details." },
          "401": { description: "No valid session." },
          "403": { description: "Consumer role required." },
        },
      },
      post: {
        tags: ["Consent"],
        summary: "Grant purpose-specific consent to a lender",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["purpose", "scope"],
                properties: {
                  purpose: { type: "string" },
                  description: { type: "string" },
                  lender_email: { type: "string", format: "email" },
                  scope: {
                    type: "array",
                    items: { type: "string", enum: ["assessment", "payment_summary", "report"] },
                  },
                  expires_at: { type: "string", format: "date" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Consent granted." },
          "401": { description: "No valid session." },
          "403": { description: "Consumer role required." },
          "422": { description: "Validation error." },
        },
      },
    },
    "/api/consents/{id}": {
      get: {
        tags: ["Consent"],
        summary: "Read one consent record",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Consent detail." },
          "404": { description: "Consent not found." },
        },
      },
      patch: {
        tags: ["Consent"],
        summary: "Update or withdraw a consent record",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: { status: { type: "string", enum: ["granted", "withdrawn"] } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Consent updated." },
          "404": { description: "Consent not found." },
          "422": { description: "Validation error." },
        },
      },
    },
    "/api/reports": {
      get: {
        tags: ["Reports"],
        summary: "List the signed-in consumer's immutable reports",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Report summaries." } },
      },
      post: {
        tags: ["Reports"],
        summary: "Generate an immutable report from the current assessment",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { lookback_months: { type: "integer", minimum: 1, maximum: 24 } },
              },
            },
          },
        },
        responses: {
          "201": { description: "Report generated and stored immutably." },
          "401": { description: "No valid session." },
          "422": { description: "Validation error." },
        },
      },
    },
    "/api/reports/{id}": {
      get: {
        tags: ["Reports"],
        summary: "Read an immutable report by id",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Report content, hash, version, and immutability flag." },
          "404": { description: "Report not found or not authorized." },
        },
      },
    },
    "/api/synthetic-data": {
      get: {
        tags: ["Synthetic Data"],
        summary: "List synthetic data generation jobs",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Synthetic job list." } },
      },
      post: {
        tags: ["Synthetic Data"],
        summary: "Generate fictional payment records",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["categories", "record_count", "lookback_months"],
                properties: {
                  categories: {
                    type: "array",
                    minItems: 1,
                    items: { type: "string", enum: ["rent", "electricity", "mobile"] },
                  },
                  record_count: { type: "integer", minimum: 1, maximum: 120 },
                  lookback_months: { type: "integer", minimum: 1, maximum: 24 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Synthetic job completed." },
          "422": { description: "Validation error." },
        },
      },
    },
    "/api/lender/applicants": {
      get: {
        tags: ["Lender"],
        summary: "List applicants with active lender consent",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": { description: "Consent-scoped applicant summaries." },
          "403": { description: "Lender role required." },
        },
      },
    },
    "/api/lender/applicants/{id}": {
      get: {
        tags: ["Lender"],
        summary: "Read one applicant summary and payment history",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Applicant detail." },
          "404": { description: "Applicant not found or consent is inactive." },
        },
      },
    },
    "/api/lender/applicants/{id}/notes": {
      get: {
        tags: ["Lender"],
        summary: "List internal notes for an applicant",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Note list." } },
      },
      post: {
        tags: ["Lender"],
        summary: "Add an internal note for an applicant",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["body"],
                properties: { body: { type: "string", maxLength: 4000 } },
              },
            },
          },
        },
        responses: {
          "201": { description: "Note created." },
          "404": { description: "Applicant not found or consent is inactive." },
        },
      },
    },
    "/api/lender/notes/{id}": {
      delete: {
        tags: ["Lender"],
        summary: "Delete an internal lender note",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Note deleted." }, "404": { description: "Note not found." } },
      },
    },
    "/api/lender/consents": {
      get: {
        tags: ["Lender"],
        summary: "List consents granted to the lender organization",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Lender-scoped consent list." } },
      },
    },
    "/api/lender/reports": {
      get: {
        tags: ["Lender"],
        summary: "List reports generated by the lender",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Lender report summaries." } },
      },
      post: {
        tags: ["Lender"],
        summary: "Generate an immutable report for a consented applicant",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["applicant_id"],
                properties: {
                  applicant_id: { type: "string" },
                  lookback_months: { type: "integer", minimum: 1, maximum: 24 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Immutable lender report generated." },
          "404": { description: "Applicant not found or consent is inactive." },
        },
      },
    },
    "/api/admin/overview": {
      get: {
        tags: ["Administration"],
        summary: "Administrator operational overview",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Counts and recent operational activity." } },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Administration"],
        summary: "List users",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Paginated user list." } },
      },
    },
    "/api/admin/users/{id}": {
      patch: {
        tags: ["Administration"],
        summary: "Update user role or status",
        description:
          "Role and status changes revoke refresh tokens and increment the session version. The last active administrator cannot be demoted or disabled.",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "User updated." },
          "400": { description: "Invalid role/status or last-administrator protection." },
          "404": { description: "User not found." },
        },
      },
    },
    "/api/admin/payments": {
      get: {
        tags: ["Administration"],
        summary: "List synthetic payments across users",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Paginated payment list." } },
      },
    },
    "/api/admin/consents": {
      get: {
        tags: ["Administration"],
        summary: "List all consent records",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Paginated consent list." } },
      },
    },
    "/api/admin/reports": {
      get: {
        tags: ["Administration"],
        summary: "List all immutable reports",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Paginated report list." } },
      },
    },
    "/api/admin/audit-logs": {
      get: {
        tags: ["Administration"],
        summary: "List append-only audit events",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Paginated audit log." } },
      },
    },
    "/api/admin/organizations": {
      get: {
        tags: ["Administration"],
        summary: "List lender organizations and members",
        security: [{ sessionCookie: [] }],
        responses: { "200": { description: "Organization list." } },
      },
    },
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: { "200": { description: "Service healthy." } },
      },
    },
  },
} as const;
