/**
 * OpenAPI 3.0 specification for the FindOut REST API.
 *
 * Served as interactive documentation at GET /api-docs (see server.js).
 * The raw JSON is available at GET /api-docs.json.
 *
 * Kept as a single module rather than as JSDoc annotations spread across 33
 * controllers: one file is easier to keep consistent, and it can be read as a
 * contract independently of the implementation.
 */

const PORT = process.env.PORT || 5000;

/* ── Reusable response bodies ──────────────────────────────────────────── */
const Unauthorized = {
  description: 'Missing, malformed or expired access token',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
      example: { message: 'No token, authorization denied' },
    },
  },
};

const NotFound = {
  description: 'Resource not found',
  content: {
    'application/json': { schema: { $ref: '#/components/schemas/Error' } },
  },
};

const ServerError = {
  description: 'Unexpected server error',
  content: {
    'application/json': { schema: { $ref: '#/components/schemas/Error' } },
  },
};

/** Shorthand for a JSON request body. */
const body = (schema, required = true) => ({
  required,
  content: { 'application/json': { schema } },
});

/** Shorthand for a 200 JSON response. */
const ok = (description, schema) => ({
  description,
  content: { 'application/json': { schema } },
});

/** Shorthand for a path parameter. */
const pathParam = (name, description) => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description,
});

const openapiSpec = {
  openapi: '3.0.3',

  info: {
    title: 'FindOut API',
    version: '1.0.0',
    description: `
REST API for **FindOut**, a peer-learning platform that matches students who
want to learn a subject with students willing to teach it.

### Authentication

Most endpoints require a JSON Web Token issued by \`POST /api/login\`.
Send it as a bearer token:

    Authorization: Bearer <accessToken>

Access tokens expire after **15 minutes**. Use \`POST /api/refresh-token\`
with the refresh token (valid 7 days) to obtain a new one.

Administrator endpoints use a **separate** identity issued by
\`POST /api/admin/login\`; a user token is not accepted on those routes.

### Real-time channel

Messaging is delivered over Socket.IO rather than REST. Those events are not
described here — see Chapter 4 of the project documentation.

### Trying requests from this page

Click **Authorize**, paste an access token, and the token will be attached to
every request you send from the interface.
    `.trim(),
    contact: { name: 'FindOut project' },
    license: { name: 'ISC' },
  },

  servers: [
    { url: `http://localhost:${PORT}`, description: 'Local development' },
  ],

  tags: [
    { name: 'Authentication', description: 'Registration, email verification, login, tokens' },
    { name: 'Profile', description: 'User details, subjects, availability, profile picture' },
    { name: 'Matching', description: 'Peer and group suggestions — the core feature' },
    { name: 'Verification', description: 'Subject competency quizzes and badges' },
    { name: 'Groups', description: 'Study group lifecycle, membership and privacy' },
    { name: 'Messaging', description: 'Chats and message history (delivery is over WebSocket)' },
    { name: 'Feed', description: 'Learning resource posts, comments and replies' },
    { name: 'Search', description: 'Global search and discovery' },
    { name: 'Administration', description: 'Platform moderation and analytics' },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token from POST /api/login',
      },
      adminAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Admin token from POST /api/admin/login',
      },
    },

    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' },
        },
      },

      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6a25ac174b5e4dfd55d721b8' },
          name: { type: 'string', example: 'Ama Mensah' },
          email: { type: 'string', format: 'email', example: 'ama@st.ug.edu.gh' },
          profilePicture: {
            type: 'string',
            nullable: true,
            example: '/uploads/1785050788588-photo.jpeg',
            description: 'Root-relative path. Prefix with the server origin to build a URL.',
          },
          subjects: {
            type: 'array',
            items: { type: 'string' },
            example: ['Calculus', 'Data Structures'],
          },
          status: {
            type: 'string',
            enum: ['Ready To Teach', 'Ready To Learn', 'Later'],
            example: 'Ready To Learn',
          },
          freetime: { type: 'string', nullable: true },
          isVerified: { type: 'boolean', example: true },
          verifiedSubjects: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                subject: { type: 'string', example: 'Calculus' },
                verifiedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          reputation: { type: 'integer', example: 0 },
          isOnline: { type: 'boolean', example: true },
          lastSeen: { type: 'string', format: 'date-time' },
        },
      },

      SuggestedUser: {
        type: 'object',
        description: 'A ranked match. Ordering is by descending match score.',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Kwame Boateng' },
          status: { type: 'string', example: 'Ready To Teach' },
          subjects: { type: 'array', items: { type: 'string' } },
          profilePicture: { type: 'string', nullable: true },
          isOnline: { type: 'boolean' },
        },
      },

      SuggestedGroup: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          groupName: { type: 'string', example: 'Calculus Study Group' },
          groupProfile: { type: 'string', nullable: true },
          subjects: { type: 'array', items: { type: 'string' } },
          members: { type: 'array', items: { type: 'string' } },
          isPrivate: { type: 'boolean' },
          pendingRequests: { type: 'array', items: { type: 'object' } },
        },
      },

      Group: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          groupName: { type: 'string', example: 'Calculus Study Group' },
          subjects: { type: 'array', items: { type: 'string' } },
          description: { type: 'string', maxLength: 500 },
          meetingTime: { type: 'string', nullable: true },
          groupAdmin: { type: 'string' },
          members: { type: 'array', items: { type: 'string' } },
          privacy: {
            type: 'string',
            enum: ['public', 'private', 'secret'],
            description:
              'public: join immediately. private: visible, requires approval. secret: hidden, invite link only.',
          },
          inviteCode: { type: 'string', example: 'a3f9c81b4e2d7f60' },
          pendingRequests: { type: 'array', items: { type: 'object' } },
        },
      },

      Message: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          chatId: { type: 'string' },
          senderId: { type: 'string' },
          content: { type: 'string', example: 'Are you free to go over integration today?' },
          type: { type: 'string', enum: ['text', 'audio', 'system'] },
          status: { type: 'string', enum: ['sending', 'sent', 'delivered', 'read'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          author: { $ref: '#/components/schemas/User' },
          image: { type: 'string', example: '/uploads/posts/post-1785050840171.jpeg' },
          caption: { type: 'string', maxLength: 500 },
          postType: {
            type: 'string',
            enum: ['resource', 'help', 'explanation', 'challenge', 'general'],
          },
          subject: { type: 'string', example: 'Statistics' },
          helpfulCount: { type: 'integer' },
          commentCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      QuizQuestion: {
        type: 'object',
        description: 'Correct answers are never included in a response.',
        properties: {
          question: { type: 'string' },
          options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        },
      },

      QuizResult: {
        type: 'object',
        properties: {
          score: { type: 'integer', example: 8 },
          totalQuestions: { type: 'integer', example: 10 },
          percentage: { type: 'integer', example: 80 },
          passed: { type: 'boolean', description: 'True when percentage >= 70' },
          timeSpent: { type: 'integer', description: 'Seconds' },
        },
      },

      TokenPair: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Login successful' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          accessToken: { type: 'string', description: 'Expires in 15 minutes' },
          refreshToken: { type: 'string', description: 'Expires in 7 days' },
        },
      },
    },
  },

  /* Applied to every operation unless overridden with `security: []`. */
  security: [{ bearerAuth: [] }],

  paths: {
    /* ── Authentication ─────────────────────────────────────────────── */
    '/api/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new account',
        description:
          'Creates an unverified account, hashes the password with bcrypt (cost 10) and sends a verification email. Login is refused until the address is confirmed.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Ama Mensah' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password', minLength: 8 },
                  profilePicture: {
                    type: 'string',
                    format: 'binary',
                    description: 'JPEG or PNG, maximum 2 MB',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: ok('Account created; verification email sent', {
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: { $ref: '#/components/schemas/User' },
            },
          }),
          400: {
            description: 'Email already registered',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: ServerError,
        },
      },
    },

    '/api/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in and obtain a token pair',
        security: [],
        requestBody: body({
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        }),
        responses: {
          200: ok('Authenticated', { $ref: '#/components/schemas/TokenPair' }),
          400: { description: 'User not found or invalid credentials' },
          403: { description: 'Email address not yet verified' },
          500: ServerError,
        },
      },
    },

    '/api/verify-email': {
      get: {
        tags: ['Authentication'],
        summary: 'Confirm an email address',
        description:
          'Consumes the signed token from the verification email. Note: the token currently expires 60 seconds after issue (defect D-07).',
        security: [],
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Address verified' },
          400: { description: 'Missing, invalid or expired token' },
          404: NotFound,
        },
      },
    },

    '/api/send-verification-email': {
      post: {
        tags: ['Authentication'],
        summary: 'Send a verification email',
        security: [],
        requestBody: body({
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        }),
        responses: { 200: { description: 'Email sent' }, 500: ServerError },
      },
    },

    '/api/resend-verification-email': {
      post: {
        tags: ['Authentication'],
        summary: 'Resend the verification email',
        security: [],
        requestBody: body({
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        }),
        responses: { 200: { description: 'Email resent' }, 404: NotFound },
      },
    },

    '/api/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Exchange a refresh token for a new access token',
        security: [],
        requestBody: body({
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string' } },
        }),
        responses: {
          200: ok('New access token issued', {
            type: 'object',
            properties: { accessToken: { type: 'string' } },
          }),
          400: { description: 'Refresh token not supplied' },
          401: { description: 'Refresh token invalid or expired' },
        },
      },
    },

    '/api/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out and mark the user offline',
        responses: { 200: { description: 'Logged out' }, 401: Unauthorized },
      },
    },

    /* ── Profile ────────────────────────────────────────────────────── */
    '/api/user-details': {
      get: {
        tags: ['Profile'],
        summary: 'Get the authenticated user',
        responses: {
          200: ok('Current user', { $ref: '#/components/schemas/User' }),
          401: Unauthorized,
          404: NotFound,
        },
      },
    },

    '/api/edit-user': {
      put: {
        tags: ['Profile'],
        summary: 'Update subjects, availability or free time',
        description:
          'Subjects drive matching. Availability determines which complementary role the user is matched against.',
        requestBody: body({
          type: 'object',
          properties: {
            subjects: { type: 'array', items: { type: 'string' }, example: ['Calculus', 'Physics'] },
            status: { type: 'string', enum: ['Ready To Teach', 'Ready To Learn', 'Later'] },
            freetime: { type: 'string', example: 'Weekday evenings' },
          },
        }),
        responses: {
          200: ok('Updated user', { $ref: '#/components/schemas/User' }),
          401: Unauthorized,
        },
      },
    },

    '/api/profile-picture': {
      post: {
        tags: ['Profile'],
        summary: 'Upload a profile picture',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['profilePicture'],
                properties: {
                  profilePicture: {
                    type: 'string',
                    format: 'binary',
                    description: 'JPEG or PNG, maximum 2 MB',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: ok('Stored path returned', {
            type: 'object',
            properties: {
              message: { type: 'string' },
              profilePicture: { type: 'string', example: '/uploads/1785050788588-photo.jpeg' },
            },
          }),
          400: { description: 'No file supplied, or file rejected by type or size' },
          401: Unauthorized,
        },
      },
    },

    /* ── Matching ───────────────────────────────────────────────────── */
    '/api/suggestions': {
      get: {
        tags: ['Matching'],
        summary: 'Get ranked peer and group suggestions',
        description: `
The core endpoint of the platform. Returns up to 15 users and 15 groups,
ranked by match score.

**Scoring**

| Component | Weight |
|---|---|
| Complementary availability (Teach ↔ Learn) | 20 |
| Exact subject match after normalisation | 10 |
| One subject name contains the other | 7 |
| First three characters match | 5 |
| Edit-distance similarity >= 0.7 | floor(5 x similarity) |
| Candidate currently online | 3 |
| More than one subject matched | 2 per match |

Excluded before scoring: the requester, users they already have a direct chat
with, groups they belong to, and groups with a pending join request.

A user who has declared no subjects receives empty lists and a prompt.
        `.trim(),
        responses: {
          200: ok('Ranked suggestions', {
            type: 'object',
            properties: {
              suggestedUsers: {
                type: 'array',
                items: { $ref: '#/components/schemas/SuggestedUser' },
              },
              suggestedGroups: {
                type: 'array',
                items: { $ref: '#/components/schemas/SuggestedGroup' },
              },
              message: {
                type: 'string',
                description: 'Present only when the user has declared no subjects',
              },
            },
          }),
          401: Unauthorized,
          404: NotFound,
        },
      },
    },

    /* ── Verification ───────────────────────────────────────────────── */
    '/api/verification/status': {
      get: {
        tags: ['Verification'],
        summary: 'Verification state for each declared subject',
        responses: {
          200: ok('Per-subject status', {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              isVerified: { type: 'boolean' },
              verifiedSubjects: { type: 'array', items: { type: 'object' } },
              subjectStatus: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    subject: { type: 'string' },
                    status: {
                      type: 'string',
                      enum: ['not_started', 'in_progress', 'verified'],
                    },
                    canTakeQuiz: { type: 'boolean' },
                    attemptsRemaining: { type: 'integer', maximum: 3 },
                    bestScore: { type: 'integer' },
                  },
                },
              },
            },
          }),
          401: Unauthorized,
        },
      },
    },

    '/api/verification/start-quiz': {
      post: {
        tags: ['Verification'],
        summary: 'Begin a competency quiz',
        description:
          'Returns 10 questions with the correct answers removed. The full question set is held server-side against the returned session id and used for marking.',
        requestBody: body({
          type: 'object',
          required: ['subject'],
          properties: { subject: { type: 'string', example: 'Calculus' } },
        }),
        responses: {
          200: ok('Quiz session started', {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              quizSessionId: { type: 'string' },
              subject: { type: 'string' },
              questions: {
                type: 'array',
                items: { $ref: '#/components/schemas/QuizQuestion' },
              },
              totalQuestions: { type: 'integer', example: 10 },
              passingScore: { type: 'integer', example: 70 },
              timeLimit: { type: 'integer', example: 600, description: 'Seconds' },
              attemptsRemaining: { type: 'integer' },
            },
          }),
          400: {
            description:
              'Subject not on the profile, already verified, or three attempts already used',
          },
          401: Unauthorized,
        },
      },
    },

    '/api/verification/submit-quiz': {
      post: {
        tags: ['Verification'],
        summary: 'Submit answers for marking',
        description:
          'Marking occurs entirely server-side. Passing at 70% or above awards the subject badge.',
        requestBody: body({
          type: 'object',
          required: ['quizSessionId', 'answers'],
          properties: {
            quizSessionId: { type: 'string' },
            answers: {
              type: 'array',
              items: { type: 'integer', minimum: 0, maximum: 3 },
              description: 'Selected option index per question, in order',
              example: [0, 1, 1, 1, 1, 1, 1, 0, 1, 1],
            },
          },
        }),
        responses: {
          200: ok('Marked result', {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              result: { $ref: '#/components/schemas/QuizResult' },
              verification: { type: 'object' },
            },
          }),
          400: { description: 'Malformed submission' },
          403: { description: 'Session belongs to a different user' },
          404: { description: 'Session not found or expired' },
        },
      },
    },

    '/api/verification/history': {
      get: {
        tags: ['Verification'],
        summary: 'Past quiz attempts',
        parameters: [
          {
            name: 'subject',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter to a single subject',
          },
        ],
        responses: { 200: { description: 'Attempt history' }, 401: Unauthorized },
      },
    },

    /* ── Groups ─────────────────────────────────────────────────────── */
    '/api/creategroup': {
      post: {
        tags: ['Groups'],
        summary: 'Create a study group',
        description: 'The creator becomes the group administrator and its first member.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['groupName', 'subjects'],
                properties: {
                  groupName: { type: 'string', example: 'Calculus Study Group' },
                  subjects: { type: 'string', example: 'Calculus,Linear Algebra' },
                  description: { type: 'string', maxLength: 500 },
                  privacy: {
                    type: 'string',
                    enum: ['public', 'private', 'secret'],
                    default: 'public',
                  },
                  groupProfile: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: ok('Group created', {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              group: { $ref: '#/components/schemas/Group' },
            },
          }),
          400: { description: 'Not authenticated' },
          500: ServerError,
        },
      },
    },

    '/api/my-groups': {
      get: {
        tags: ['Groups'],
        summary: 'Groups the user belongs to',
        responses: {
          200: ok('Group list', {
            type: 'array',
            items: { $ref: '#/components/schemas/Group' },
          }),
          401: Unauthorized,
        },
      },
    },

    '/api/group/{groupId}': {
      get: {
        tags: ['Groups'],
        summary: 'Group detail',
        parameters: [pathParam('groupId', 'Group identifier')],
        responses: {
          200: ok('Group', { $ref: '#/components/schemas/Group' }),
          401: Unauthorized,
          404: NotFound,
        },
      },
    },

    '/api/join-group': {
      post: {
        tags: ['Groups'],
        summary: 'Join a group, or request to join',
        description:
          'Behaviour depends on privacy: public joins immediately; private creates a pending request and notifies the administrator; secret is refused, since it can only be joined by invite link.',
        requestBody: body({
          type: 'object',
          required: ['groupId'],
          properties: { groupId: { type: 'string' } },
        }),
        responses: {
          200: ok('Joined, or request recorded', {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              isPending: { type: 'boolean' },
              group: { $ref: '#/components/schemas/Group' },
            },
          }),
          403: { description: 'Group is secret; invite link required' },
          404: NotFound,
        },
      },
    },

    '/api/join/{inviteCode}': {
      get: {
        tags: ['Groups'],
        summary: 'Join via invite link',
        description: 'The only route into a secret group.',
        parameters: [pathParam('inviteCode', '16-character hex invite code')],
        responses: {
          200: { description: 'Joined' },
          401: Unauthorized,
          404: { description: 'Invalid invite code' },
        },
      },
    },

    '/api/groups/handle-join-request': {
      post: {
        tags: ['Groups'],
        summary: 'Approve or reject a pending request',
        description: 'Group administrator only.',
        requestBody: body({
          type: 'object',
          required: ['groupId', 'userId', 'action'],
          properties: {
            groupId: { type: 'string' },
            userId: { type: 'string' },
            action: { type: 'string', enum: ['approve', 'reject'] },
          },
        }),
        responses: {
          200: { description: 'Request resolved' },
          403: { description: 'Not the group administrator' },
          404: NotFound,
        },
      },
    },

    '/api/groups/update-privacy': {
      put: {
        tags: ['Groups'],
        summary: 'Change the privacy level',
        requestBody: body({
          type: 'object',
          required: ['groupId', 'privacy'],
          properties: {
            groupId: { type: 'string' },
            privacy: { type: 'string', enum: ['public', 'private', 'secret'] },
          },
        }),
        responses: { 200: { description: 'Updated' }, 403: { description: 'Not the administrator' } },
      },
    },

    '/api/edit-group': {
      put: {
        tags: ['Groups'],
        summary: 'Edit group details',
        requestBody: body({
          type: 'object',
          properties: {
            groupId: { type: 'string' },
            groupName: { type: 'string' },
            subjects: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' },
            meetingTime: { type: 'string' },
          },
        }),
        responses: { 200: { description: 'Updated' }, 403: { description: 'Not the administrator' } },
      },
    },

    '/api/add-member': {
      post: {
        tags: ['Groups'],
        summary: 'Add a member',
        requestBody: body({
          type: 'object',
          required: ['groupId', 'userId'],
          properties: { groupId: { type: 'string' }, userId: { type: 'string' } },
        }),
        responses: { 200: { description: 'Member added' }, 404: NotFound },
      },
    },

    '/api/groups/remove-member': {
      put: {
        tags: ['Groups'],
        summary: 'Remove a member',
        requestBody: body({
          type: 'object',
          required: ['groupId', 'userId'],
          properties: { groupId: { type: 'string' }, userId: { type: 'string' } },
        }),
        responses: { 200: { description: 'Member removed' }, 403: { description: 'Not the administrator' } },
      },
    },

    '/api/groups/leave': {
      post: {
        tags: ['Groups'],
        summary: 'Leave a group',
        requestBody: body({
          type: 'object',
          required: ['groupId'],
          properties: { groupId: { type: 'string' } },
        }),
        responses: { 200: { description: 'Left the group' }, 404: NotFound },
      },
    },

    '/api/deletegroup/{groupId}': {
      delete: {
        tags: ['Groups'],
        summary: 'Delete a group',
        parameters: [pathParam('groupId', 'Group identifier')],
        responses: {
          200: { description: 'Deleted' },
          403: { description: 'Not the administrator' },
          404: NotFound,
        },
      },
    },

    '/api/group-profile-picture': {
      post: {
        tags: ['Groups'],
        summary: 'Upload a group picture',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  groupProfile: { type: 'string', format: 'binary' },
                  groupId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Uploaded' }, 400: { description: 'No file supplied' } },
      },
    },

    /* ── Messaging ──────────────────────────────────────────────────── */
    '/api/chats': {
      get: {
        tags: ['Messaging'],
        summary: 'All conversations for the user',
        description:
          'Includes both direct chats and groups, each with its last message and the unread count for this user.',
        responses: {
          200: ok('Conversation list', {
            type: 'object',
            properties: { chats: { type: 'array', items: { type: 'object' } } },
          }),
          401: Unauthorized,
        },
      },
    },

    '/api/start-new-chat': {
      post: {
        tags: ['Messaging'],
        summary: 'Open a direct conversation',
        description: 'Returns the existing chat when one is already present, rather than creating a duplicate.',
        requestBody: body({
          type: 'object',
          required: ['userIdToChat'],
          properties: { userIdToChat: { type: 'string' } },
        }),
        responses: {
          200: ok('Chat opened', {
            type: 'object',
            properties: { chat: { type: 'object' } },
          }),
          401: Unauthorized,
        },
      },
    },

    '/api/messages/{chatId}': {
      get: {
        tags: ['Messaging'],
        summary: 'Message history for a conversation',
        parameters: [pathParam('chatId', 'Chat or group identifier')],
        responses: {
          200: ok('Messages in ascending time order', {
            type: 'array',
            items: { $ref: '#/components/schemas/Message' },
          }),
          401: Unauthorized,
          500: ServerError,
        },
      },
    },

    '/api/messages': {
      post: {
        tags: ['Messaging'],
        summary: 'Send a message over REST',
        description:
          'The application normally sends messages over Socket.IO; this route is a fallback. Note that `senderId` is currently taken from the request body rather than the token (defect D-22).',
        requestBody: body({
          type: 'object',
          required: ['chatId', 'content', 'senderId'],
          properties: {
            chatId: { type: 'string' },
            content: { type: 'string' },
            senderId: { type: 'string' },
          },
        }),
        responses: {
          201: ok('Message stored', { $ref: '#/components/schemas/Message' }),
          400: { description: 'Required field missing' },
        },
      },
    },

    '/api/messages/audio': {
      post: {
        tags: ['Messaging'],
        summary: 'Upload a voice message',
        security: [],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  audio: { type: 'string', format: 'binary' },
                  chatId: { type: 'string' },
                  senderId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Voice message stored' },
          400: { description: 'No audio supplied' },
        },
      },
    },

    /* ── Feed ───────────────────────────────────────────────────────── */
    '/api/add-post': {
      post: {
        tags: ['Feed'],
        summary: 'Publish a learning resource',
        description: 'An image is currently required (defect D-13 proposes relaxing this).',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image', 'subject'],
                properties: {
                  image: { type: 'string', format: 'binary', description: 'Maximum 5 MB' },
                  caption: { type: 'string', maxLength: 500 },
                  subject: { type: 'string', example: 'Statistics' },
                  postType: {
                    type: 'string',
                    enum: ['resource', 'help', 'explanation', 'challenge', 'general'],
                    default: 'general',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: ok('Post created', {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              post: { $ref: '#/components/schemas/Post' },
            },
          }),
          400: { description: 'No image supplied, or file rejected' },
          401: { description: 'Not authenticated' },
        },
      },
    },

    '/api/getallposts': {
      get: {
        tags: ['Feed'],
        summary: 'List posts',
        description: 'Currently unauthenticated (defect D-04), which also prevents the per-user helpful flag from being resolved.',
        security: [],
        parameters: [
          { name: 'subject', in: 'query', schema: { type: 'string' } },
          {
            name: 'postType',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['resource', 'help', 'explanation', 'challenge', 'general'],
            },
          },
        ],
        responses: {
          200: ok('Posts, newest first', {
            type: 'array',
            items: { $ref: '#/components/schemas/Post' },
          }),
        },
      },
    },

    '/api/posts/{postId}/helpful': {
      post: {
        tags: ['Feed'],
        summary: 'Mark or unmark a post as helpful',
        description: 'Named "helpful" rather than "like" to signal educational value.',
        parameters: [pathParam('postId', 'Post identifier')],
        responses: { 200: { description: 'Toggled' }, 401: Unauthorized, 404: NotFound },
      },
    },

    '/api/posts/delete-post/{postId}': {
      delete: {
        tags: ['Feed'],
        summary: 'Delete a post',
        parameters: [pathParam('postId', 'Post identifier')],
        responses: {
          200: { description: 'Deleted' },
          403: { description: 'Not the author' },
          404: NotFound,
        },
      },
    },

    '/api/posts/{postId}/comments': {
      post: {
        tags: ['Feed'],
        summary: 'Add a comment',
        parameters: [pathParam('postId', 'Post identifier')],
        requestBody: body({
          type: 'object',
          required: ['text'],
          properties: { text: { type: 'string', maxLength: 300 } },
        }),
        responses: { 201: { description: 'Comment added' }, 401: Unauthorized },
      },
    },

    '/api/posts/{postId}/get-comments': {
      get: {
        tags: ['Feed'],
        summary: 'List comments with their replies',
        parameters: [pathParam('postId', 'Post identifier')],
        responses: { 200: { description: 'Comment thread' }, 404: NotFound },
      },
    },

    '/api/comments/{commentId}/like': {
      post: {
        tags: ['Feed'],
        summary: 'Like a comment',
        parameters: [pathParam('commentId', 'Comment identifier')],
        responses: { 200: { description: 'Toggled' }, 401: Unauthorized },
      },
    },

    '/api/comments/{commentId}/reply': {
      post: {
        tags: ['Feed'],
        summary: 'Reply to a comment',
        parameters: [pathParam('commentId', 'Comment identifier')],
        requestBody: body({
          type: 'object',
          required: ['text'],
          properties: { text: { type: 'string', maxLength: 300 } },
        }),
        responses: { 201: { description: 'Reply added' }, 401: Unauthorized },
      },
    },

    '/api/comments/{commentId}/replies': {
      get: {
        tags: ['Feed'],
        summary: 'List replies to a comment',
        parameters: [pathParam('commentId', 'Comment identifier')],
        responses: { 200: { description: 'Replies' }, 404: NotFound },
      },
    },

    '/api/comments/{commentId}/replies/{replyId}': {
      delete: {
        tags: ['Feed'],
        summary: 'Delete a reply',
        parameters: [
          pathParam('commentId', 'Comment identifier'),
          pathParam('replyId', 'Reply identifier'),
        ],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Not the author' } },
      },
    },

    /* ── Search ─────────────────────────────────────────────────────── */
    '/api/search': {
      get: {
        tags: ['Search'],
        summary: 'Search users, groups and posts',
        description: 'Secret groups are excluded from all results.',
        parameters: [
          {
            name: 'query',
            in: 'query',
            required: true,
            schema: { type: 'string', minLength: 2 },
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['all', 'users', 'groups', 'posts'], default: 'all' },
          },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Matching results grouped by type' },
          400: { description: 'Query shorter than two characters' },
          401: Unauthorized,
        },
      },
    },

    '/api/search-users': {
      get: {
        tags: ['Search'],
        summary: 'Search users by name or subject',
        parameters: [{ name: 'query', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Matching users' }, 401: Unauthorized },
      },
    },

    '/api/explore/groups': {
      get: {
        tags: ['Search'],
        summary: 'Browse discoverable groups',
        responses: { 200: { description: 'Public and private groups' }, 401: Unauthorized },
      },
    },

    '/api/explore/users': {
      get: {
        tags: ['Search'],
        summary: 'Browse users',
        responses: { 200: { description: 'User list' }, 401: Unauthorized },
      },
    },

    /* ── Administration ─────────────────────────────────────────────── */
    '/api/admin/login': {
      post: {
        tags: ['Administration'],
        summary: 'Administrator login',
        description: 'A separate identity from user accounts, stored in its own collection.',
        security: [],
        requestBody: body({
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        }),
        responses: {
          200: ok('Administrator token', {
            type: 'object',
            properties: { success: { type: 'boolean' }, token: { type: 'string' } },
          }),
          401: { description: 'Invalid credentials' },
        },
      },
    },

    '/api/admin/me': {
      get: {
        tags: ['Administration'],
        summary: 'Current administrator',
        security: [{ adminAuth: [] }],
        responses: { 200: { description: 'Administrator record' }, 401: Unauthorized },
      },
    },

    '/api/admin/logout': {
      post: {
        tags: ['Administration'],
        summary: 'Administrator logout',
        security: [{ adminAuth: [] }],
        responses: { 200: { description: 'Logged out' } },
      },
    },

    '/api/admin/dashboard/stats': {
      get: {
        tags: ['Administration'],
        summary: 'Platform statistics',
        description:
          'Totals, teach and learn counts, online users, recent signups, posts grouped by type, the ten most active subjects, and the top contributors by reputation.',
        security: [{ adminAuth: [] }],
        responses: {
          200: ok('Aggregated statistics', {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              stats: {
                type: 'object',
                properties: {
                  users: { type: 'object' },
                  posts: { type: 'object' },
                  groups: { type: 'object' },
                  topSubjects: { type: 'array', items: { type: 'object' } },
                  topContributors: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          }),
          401: Unauthorized,
        },
      },
    },

    '/api/admin/users': {
      get: {
        tags: ['Administration'],
        summary: 'List all users',
        security: [{ adminAuth: [] }],
        responses: { 200: { description: 'User list' }, 401: Unauthorized },
      },
    },

    '/api/admin/users/{userId}/verify': {
      patch: {
        tags: ['Administration'],
        summary: 'Manually verify a user',
        security: [{ adminAuth: [] }],
        parameters: [pathParam('userId', 'User identifier')],
        responses: { 200: { description: 'Verified' }, 404: NotFound },
      },
    },

    '/api/admin/users/{userId}/unverify': {
      patch: {
        tags: ['Administration'],
        summary: 'Remove a user verification',
        description:
          'Caution: `isVerified` currently carries two meanings — email confirmed and quiz passed (defect D-18) — so this can lock a user out of login.',
        security: [{ adminAuth: [] }],
        parameters: [pathParam('userId', 'User identifier')],
        responses: { 200: { description: 'Unverified' }, 404: NotFound },
      },
    },

    '/api/admin/users/{userId}': {
      delete: {
        tags: ['Administration'],
        summary: 'Delete a user',
        description:
          'Does not currently cascade to that user\'s posts, messages or group memberships (defect D-14).',
        security: [{ adminAuth: [] }],
        parameters: [pathParam('userId', 'User identifier')],
        responses: { 200: { description: 'Deleted' }, 404: NotFound },
      },
    },

    '/api/admin/users/{userId}/promote': {
      post: {
        tags: ['Administration'],
        summary: 'Promote a user to administrator',
        description: 'Restricted to super administrators.',
        security: [{ adminAuth: [] }],
        parameters: [pathParam('userId', 'User identifier')],
        responses: {
          200: { description: 'Promoted' },
          403: { description: 'Super administrator privilege required' },
        },
      },
    },

    '/api/admin/posts': {
      get: {
        tags: ['Administration'],
        summary: 'List all posts for moderation',
        security: [{ adminAuth: [] }],
        responses: { 200: { description: 'Post list' }, 401: Unauthorized },
      },
    },

    '/api/admin/posts/{postId}': {
      delete: {
        tags: ['Administration'],
        summary: 'Remove a post',
        security: [{ adminAuth: [] }],
        parameters: [pathParam('postId', 'Post identifier')],
        responses: { 200: { description: 'Deleted' }, 404: NotFound },
      },
    },
  },
};

module.exports = openapiSpec;
