export const AnalyticsEvents = {
  // Screen views (automatic via navigation listener)
  SCREEN_VIEWED: 'Screen_Viewed',

  // Auth flow
  AUTH_PASSWORDLESS_EMAIL_SENT: 'Auth_PasswordlessEmailSent',
  AUTH_OTP_RESENT: 'Auth_OtpResent',
  AUTH_LOGIN_SUCCESS: 'Auth_LoginSuccess',
  AUTH_LOGOUT: 'Auth_Logout',

  // Account
  ACCOUNT_SWITCHED: 'Account_Switched',

  // Chat
  CHAT_DIRECT_CREATED: 'Chat_DirectCreated',
  CHAT_GROUP_CREATED: 'Chat_GroupCreated',
  CHAT_MESSAGE_SENT: 'Chat_MessageSent',

  // Spotlight
  SPOTLIGHT_ITEM_SELECTED: 'Spotlight_ItemSelected',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
