export default {
  id: '4e805483-a767-49cd-b363-49d96ff0e0f6',
  type: 'browser',
  expires_at: '2023-02-28T10:00:37.52752Z',
  issued_at: '2023-02-28T09:00:37.52752Z',
  request_url: 'https://kratos.factly.in/self-service/settings/browser',
  ui: {
    action:
      'https://kratos.factly.in/self-service/settings?flow=4e805483-a767-49cd-b363-49d96ff0e0f6',
    method: 'POST',
    nodes: [
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'google',
          type: 'email',
          value: 'google',
        },
      },
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'github',
          type: 'email',
          value: 'github',
        },
      },
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'default',
          type: 'email',
          value: 'default',
        },
      },
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'csrf_token',
          type: 'hidden',
          value:
            'r+4GbePj6Y9TbRNai/US2xarhPb90PNc+s9q+Cnah7/hevhpPLbOu7Lu6ibsk+Q0SkqZ6BwgQ9rRk2BrOl6eig==',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'traits.email',
          type: 'email',
          value: 'sumit.vishwakarma@factly.in',
          required: true,
          autocomplete: 'email',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1070002,
            text: 'E-Mail',
            type: 'info',
          },
        },
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'traits.name.first',
          type: 'text',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'traits.name.last',
          type: 'text',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'traits.first_name',
          type: 'text',
          value: ' Sumit',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'traits.last_name',
          type: 'text',
          value: 'Vishwakarma',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'profile',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1070003,
            text: 'Save',
            type: 'info',
          },
        },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'password',
          type: 'password',
          required: true,
          autocomplete: 'new-password',
          disabled: false,
          node_type: 'input',
        },
        messages: [{
          id: 1070004,
          text: 'Password must be at least 8 characters long.',
        }],
        meta: {
          label: {
            id: 1070001,
            text: 'Password',
            type: 'info',
          },
        },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'password',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1070003,
            text: 'Save',
            type: 'info',
          },
        },
      },
      {
        type: 'img',
        group: 'totp',
        attributes: {
          src: 'data:image/png;base64,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',
          id: 'totp_qr',
          width: 256,
          height: 256,
          node_type: 'img',
        },
        messages: [],
        meta: {
          label: {
            id: 1050005,
            text: 'Authenticator app QR code',
            type: 'info',
          },
        },
      },
      {
        type: 'text',
        group: 'totp',
        attributes: {
          text: {
            id: 1050006,
            text: 'SUP6ZLDSIRRMQCQ67CQMQDADO5ZSKF6G',
            type: 'info',
            context: {
              secret: 'SUP6ZLDSIRRMQCQ67CQMQDADO5ZSKF6G',
            },
          },
          id: 'totp_secret_key',
          node_type: 'text',
        },
        messages: [{
          id: 1050007,
          messages: ["This is your authenticator app secret. Use it if you can not scan the QR code."],
        }],
        meta: {
          label: {
            id: 1050017,
            text: 'This is your authenticator app secret. Use it if you can not scan the QR code.',
            type: 'info',
          },
        },
      },
      {
        type: 'input',
        group: 'totp',
        attributes: {
          name: 'totp_code',
          type: 'text',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1070006,
            text: 'Verify code',
            type: 'info',
          },
        },
      },
      {
        type: 'input',
        group: 'totp',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'totp',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1070003,
            text: 'Save',
            type: 'info',
          },
        },
      },
    ],
  },
  identity: {
    id: '3778debd-ae6c-468a-a4d0-106ffab96dde',
    schema_id: 'default',
    schema_url: 'https://kratos.factly.in/schemas/ZGVmYXVsdA',
    state: 'active',
    traits: {
      email: 'sumit.vishwakarma@factly.in',
      last_name: 'Vishwakarma',
      first_name: ' Sumit',
    },
    verifiable_addresses: [
      {
        id: '29e0354c-50b7-4fea-979a-e353fe999633',
        value: 'sumit.vishwakarma@factly.in',
        verified: true,
        via: 'email',
        status: 'completed',
        verified_at: '2023-02-07T13:51:49.305186Z',
        created_at: '2021-10-08T12:16:35.904145Z',
        updated_at: '2021-10-08T12:16:35.904149Z',
      },
    ],
    recovery_addresses: [
      {
        id: 'dda55784-8e00-48f0-ae5b-e3b3071d8671',
        value: 'sumit.vishwakarma@factly.in',
        via: 'email',
        created_at: '2021-10-08T12:16:35.907406Z',
        updated_at: '2021-10-08T12:16:35.907411Z',
      },
    ],
    metadata_public: null,
    created_at: '2021-10-08T12:16:35.901451Z',
    updated_at: '2021-10-08T12:16:35.901479Z',
  },
  state: 'show_form',
};
