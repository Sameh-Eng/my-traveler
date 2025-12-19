import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types'

interface AuthState {
  // User data
  user: User | null
  token: string | null
  refreshToken: string | null
  expiresAt: string | null // ISO datetime

  // Authentication state
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Session management
  sessionId: string | null
  lastActivity: string | null // ISO datetime
  deviceFingerprint: string | null

  // Two-factor authentication
  twoFactorRequired: boolean
  twoFactorMethod: 'sms' | 'email' | 'app' | null
  twoFactorBackupCodes: string[]

  // Password reset
  isResettingPassword: boolean
  resetToken: string | null
  resetEmail: string | null

  // Email verification
  isVerifyingEmail: boolean
  verificationToken: string | null

  // Social auth providers
  socialProviders: {
    google: boolean
    facebook: boolean
    apple: boolean
  }

  // Preferences
  rememberMe: boolean
  autoLoginEnabled: boolean

  // Security settings
  loginAttempts: number
  lastFailedLogin: string | null // ISO datetime
  accountLocked: boolean
  lockUntil: string | null // ISO datetime
  requirePasswordChange: boolean
  passwordChangedAt: string | null // ISO datetime

  // Actions
  // Authentication
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  register: (userData: any) => Promise<void>
  refreshAuthToken: () => Promise<void>
  verifyToken: () => Promise<boolean>

  // Two-factor authentication
  sendTwoFactorCode: (method: 'sms' | 'email' | 'app') => Promise<void>
  verifyTwoFactorCode: (code: string, backupCode?: string) => Promise<void>
  enableTwoFactor: (method: 'sms' | 'email' | 'app') => Promise<void>
  disableTwoFactor: (password: string) => Promise<void>
  generateBackupCodes: () => Promise<string[]>

  // Password management
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>

  // Email verification
  resendVerificationEmail: () => Promise<void>
  verifyEmail: (token: string) => Promise<void>

  // Social authentication
  loginWithGoogle: (userData?: any) => Promise<void>
  loginWithFacebook: () => Promise<void>
  loginWithApple: () => Promise<void>
  linkSocialProvider: (provider: string) => Promise<void>
  unlinkSocialProvider: (provider: string) => Promise<void>

  // User profile management
  updateProfile: (updates: any) => Promise<void>
  updatePreferences: (preferences: any) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>

  // Security
  updateSecuritySettings: (settings: any) => Promise<void>
  enableBiometric: () => Promise<void>
  disableBiometric: () => Promise<void>
  getSecurityLog: () => Promise<any[]>

  // Session management
  updateLastActivity: () => void
  extendSession: () => Promise<void>
  terminateAllSessions: () => Promise<void>
  terminateSession: (sessionId: string) => Promise<void>

  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  setUser: (user: User | null) => void
  setTokens: (token: string, refreshToken?: string, expiresAt?: string) => void
  clearAuth: () => void

  // Utility methods
  isTokenExpired: () => boolean
  isSessionExpired: () => boolean
  shouldRenewToken: () => boolean
  getAuthHeader: () => { Authorization: string } | {}
  hasPermission: (permission: string) => boolean
  isRole: (role: string) => boolean

  // Computed values
  getTimeUntilTokenExpiry: () => number | null
  getTimeUntilSessionExpiry: () => number | null
  getDaysSinceLastPasswordChange: () => number
  getLoginStreak: () => number
  needsPasswordChange: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,

      isAuthenticated: false,
      isLoading: false,
      error: null,

      sessionId: null,
      lastActivity: null,
      deviceFingerprint: null,

      twoFactorRequired: false,
      twoFactorMethod: null,
      twoFactorBackupCodes: [],

      isResettingPassword: false,
      resetToken: null,
      resetEmail: null,

      isVerifyingEmail: false,
      verificationToken: null,

      socialProviders: {
        google: false,
        facebook: false,
        apple: false,
      },

      rememberMe: false,
      autoLoginEnabled: false,

      loginAttempts: 0,
      lastFailedLogin: null,
      accountLocked: false,
      lockUntil: null,
      requirePasswordChange: false,
      passwordChangedAt: null,

      // Authentication actions
      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null })

        try {
          // Check if account is locked
          const state = get()
          if (state.accountLocked && state.lockUntil && new Date(state.lockUntil) > new Date()) {
            throw new Error('Account is temporarily locked. Please try again later.')
          }

          // Mock API call - replace with actual API
          const response = await mockLoginApi(email, password)

          if (response.success && response.data) {
            const { user, tokens, session } = response.data

            set({
              user: user as User,
              token: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              expiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
              isAuthenticated: true,
              sessionId: session.id,
              lastActivity: new Date().toISOString(),
              rememberMe,
              loginAttempts: 0,
              lastFailedLogin: null,
              accountLocked: false,
              lockUntil: null,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error((response as any).error?.message || 'Login failed')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed'

          set((state) => ({
            error: errorMessage,
            isLoading: false,
            loginAttempts: state.loginAttempts + 1,
            lastFailedLogin: new Date().toISOString(),
            accountLocked: state.loginAttempts >= 4, // Lock after 5 attempts
            lockUntil: state.loginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null,
          }))
        }
      },

      logout: async () => {
        try {
          // Call logout API to invalidate token
          const state = get()
          if (state.token && state.sessionId) {
            await mockLogoutApi(state.token, state.sessionId)
          }
        } catch (error) {
          console.error('Logout API error:', error)
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            isAuthenticated: false,
            sessionId: null,
            lastActivity: null,
            twoFactorRequired: false,
            twoFactorMethod: null,
            error: null,
          })
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call - replace with actual API
          const response = await mockRegisterApi(userData)

          if (response.success) {
            // Auto-login after registration
            await get().login(userData.email, userData.password, true)
          } else {
            throw new Error((response as any).error?.message || 'Registration failed')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed'
          set({ error: errorMessage, isLoading: false })
        }
      },

      refreshAuthToken: async () => {
        const state = get()
        if (!state.refreshToken) {
          await get().logout()
          return
        }

        try {
          // Mock API call - replace with actual API
          const response = await mockRefreshTokenApi(state.refreshToken)

          if (response.success) {
            const { tokens } = response.data
            set({
              token: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              expiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
              lastActivity: new Date().toISOString(),
            })
          } else {
            await get().logout()
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
          await get().logout()
        }
      },

      verifyToken: async () => {
        const state = get()
        if (!state.token) return false

        try {
          // Mock API call - replace with actual API
          const response = await mockVerifyTokenApi(state.token)
          return response.success
        } catch (error) {
          return false
        }
      },

      // Two-factor authentication
      sendTwoFactorCode: async (method) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockSendTwoFactorCodeApi(method, get().user?.email)

          if (response.success) {
            set({
              twoFactorMethod: method,
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Failed to send verification code')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send code'
          set({ error: errorMessage, isLoading: false })
        }
      },

      verifyTwoFactorCode: async (code, backupCode) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockVerifyTwoFactorCodeApi(code, backupCode)

          if (response.success) {
            set({
              twoFactorRequired: false,
              twoFactorMethod: null,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Invalid verification code')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Invalid code'
          set({ error: errorMessage, isLoading: false })
        }
      },

      enableTwoFactor: async (method) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockEnableTwoFactorApi(method)

          if (response.success) {
            set({
              twoFactorRequired: true,
              twoFactorMethod: method,
              user: get().user ? { ...get().user, twoFactorEnabled: true } as User : null,
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Failed to enable two-factor authentication')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to enable 2FA'
          set({ error: errorMessage, isLoading: false })
        }
      },

      disableTwoFactor: async (password) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockDisableTwoFactorApi(password)

          if (response.success) {
            set({
              twoFactorRequired: false,
              twoFactorMethod: null,
              twoFactorBackupCodes: [],
              user: get().user ? { ...get().user, twoFactorEnabled: false } as User : null,
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Failed to disable two-factor authentication')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to disable 2FA'
          set({ error: errorMessage, isLoading: false })
        }
      },

      generateBackupCodes: async () => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockGenerateBackupCodesApi()

          if (response.success) {
            set({
              twoFactorBackupCodes: response.data.codes,
              isLoading: false,
            })
            return response.data.codes
          } else {
            throw new Error((response as any).error?.message || 'Failed to generate backup codes')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate codes'
          set({ error: errorMessage, isLoading: false })
          return []
        }
      },

      // Password management
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockForgotPasswordApi(email)

          if (response.success) {
            set({
              isResettingPassword: true,
              resetEmail: email,
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Failed to send reset email')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email'
          set({ error: errorMessage, isLoading: false })
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockResetPasswordApi(token, newPassword)

          if (response.success) {
            set({
              isResettingPassword: false,
              resetToken: null,
              resetEmail: null,
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Failed to reset password')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to reset password'
          set({ error: errorMessage, isLoading: false })
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockChangePasswordApi(currentPassword, newPassword)

          if (response.success) {
            set({
              requirePasswordChange: false,
              passwordChangedAt: new Date().toISOString(),
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Failed to change password')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to change password'
          set({ error: errorMessage, isLoading: false })
        }
      },

      // Email verification
      resendVerificationEmail: async () => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockResendVerificationApi(get().user?.email)

          if (response.success) {
            set({ isLoading: false })
          } else {
            throw new Error((response as any).error?.message || 'Failed to send verification email')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send email'
          set({ error: errorMessage, isLoading: false })
        }
      },

      verifyEmail: async (token) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockVerifyEmailApi(token)

          if (response.success) {
            set({
              user: get().user ? { ...get().user, isVerified: true } as User : null,
              isVerifyingEmail: false,
              verificationToken: null,
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Failed to verify email')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to verify email'
          set({ error: errorMessage, isLoading: false })
        }
      },

      // Social authentication
      loginWithGoogle: async (userData?: any) => {
        // If userData is provided, it's from the OAuth callback
        if (userData) {
          set({
            user: {
              id: userData.id,
              email: userData.email,
              profile: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                avatar: userData.picture,
              },
              isVerified: userData.verified,
              provider: 'google',
            } as any,
            token: userData.accessToken,
            expiresAt: new Date(userData.expiresAt).toISOString(),
            isAuthenticated: true,
            sessionId: `google_session_${Date.now()}`,
            lastActivity: new Date().toISOString(),
            isLoading: false,
            error: null,
          })
          return
        }

        // Otherwise, redirect to Google OAuth
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api'
        window.location.href = `${apiUrl}/auth/google`
      },

      loginWithFacebook: async () => {
        // Removed - Facebook login not supported
        console.log('Facebook login is not available')
      },

      loginWithApple: async () => {
        // Mock implementation
        console.log('Apple login initiated')
      },

      linkSocialProvider: async (provider) => {
        // Mock implementation
        console.log(`Linking ${provider} account`)
      },

      unlinkSocialProvider: async (provider) => {
        // Mock implementation
        console.log(`Unlinking ${provider} account`)
      },

      // User profile management
      updateProfile: async (updates) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockUpdateProfileApi(updates)

          if (response.success) {
            set({
              user: get().user ? { ...get().user, profile: { ...get().user!.profile, ...updates } } as User : null,
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Failed to update profile')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
          set({ error: errorMessage, isLoading: false })
        }
      },

      updatePreferences: async (preferences) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockUpdatePreferencesApi(preferences)

          if (response.success) {
            set({
              user: get().user ? { ...get().user, preferences: { ...get().user!.preferences, ...preferences } } as User : null,
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Failed to update preferences')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences'
          set({ error: errorMessage, isLoading: false })
        }
      },

      uploadAvatar: async (file) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockUploadAvatarApi(file)

          if (response.success) {
            set({
              user: get().user ? { ...get().user, profile: { ...get().user!.profile, avatar: response.data.url } } as User : null,
              isLoading: false,
            })
          } else {
            throw new Error((response as any).error?.message || 'Failed to upload avatar')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar'
          set({ error: errorMessage, isLoading: false })
        }
      },

      // Security settings
      updateSecuritySettings: async (settings) => {
        set({ isLoading: true, error: null })

        try {
          // Mock API call
          const response = await mockUpdateSecuritySettingsApi(settings)

          if (response.success) {
            set({ isLoading: false })
          } else {
            throw new Error((response as any).error?.message || 'Failed to update security settings')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update security'
          set({ error: errorMessage, isLoading: false })
        }
      },

      enableBiometric: async () => {
        // Mock implementation
        console.log('Biometric authentication enabled')
      },

      disableBiometric: async () => {
        // Mock implementation
        console.log('Biometric authentication disabled')
      },

      getSecurityLog: async () => {
        // Mock implementation
        return []
      },

      // Session management
      updateLastActivity: () => {
        set({ lastActivity: new Date().toISOString() })
      },

      extendSession: async () => {
        await get().refreshAuthToken()
      },

      terminateAllSessions: async () => {
        // Mock implementation
        console.log('All sessions terminated')
        await get().logout()
      },

      terminateSession: async (sessionId) => {
        // Mock implementation
        console.log(`Session ${sessionId} terminated`)
      },

      // State management
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setUser: (user) => set({ user }),
      setTokens: (token, refreshToken, expiresAt) =>
        set({ token, refreshToken: refreshToken || null, expiresAt: expiresAt || null }),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          sessionId: null,
          lastActivity: null,
        }),

      // Utility methods
      isTokenExpired: () => {
        const { expiresAt } = get()
        if (!expiresAt) return true
        return new Date(expiresAt) <= new Date()
      },

      isSessionExpired: () => {
        const { lastActivity } = get()
        if (!lastActivity) return true
        // Session expires after 30 minutes of inactivity
        return new Date(new Date(lastActivity).getTime() + 30 * 60 * 1000) <= new Date()
      },

      shouldRenewToken: () => {
        const { expiresAt } = get()
        if (!expiresAt) return false
        // Renew token when it's within 5 minutes of expiry
        return new Date(new Date(expiresAt).getTime() - 5 * 60 * 1000) <= new Date()
      },

      getAuthHeader: () => {
        const { token } = get()
        return token ? { Authorization: `Bearer ${token}` } : {}
      },

      hasPermission: (permission) => {
        // Mock implementation - implement based on your permission system
        return true
      },

      isRole: (role) => {
        // Mock implementation - implement based on your role system
        return true
      },

      // Computed values
      getTimeUntilTokenExpiry: () => {
        const { expiresAt } = get()
        if (!expiresAt) return null
        return new Date(expiresAt).getTime() - Date.now()
      },

      getTimeUntilSessionExpiry: () => {
        const { lastActivity } = get()
        if (!lastActivity) return null
        const expiryTime = new Date(lastActivity).getTime() + 30 * 60 * 1000
        return expiryTime - Date.now()
      },

      getDaysSinceLastPasswordChange: () => {
        const { passwordChangedAt } = get()
        if (!passwordChangedAt) return Infinity
        const msSinceChange = Date.now() - new Date(passwordChangedAt).getTime()
        return Math.floor(msSinceChange / (1000 * 60 * 60 * 24))
      },

      getLoginStreak: () => {
        // Mock implementation - track login streak
        return 1
      },

      needsPasswordChange: () => {
        const { getDaysSinceLastPasswordChange, requirePasswordChange } = get()
        return requirePasswordChange || getDaysSinceLastPasswordChange() > 90
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist essential auth data
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        autoLoginEnabled: state.autoLoginEnabled,
        twoFactorRequired: state.twoFactorRequired,
        twoFactorMethod: state.twoFactorMethod,
        twoFactorBackupCodes: state.twoFactorBackupCodes,
        socialProviders: state.socialProviders,
        sessionId: state.sessionId,
        lastActivity: state.lastActivity,
      }),
    }
  )
)

// Mock API functions - replace with actual API calls
async function mockLoginApi(email: string, password: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For demo purposes, accept any email/password combination with minimum validation
  if (email && password && password.length >= 8) {
    // Extract name from email for demo
    const emailName = email.split('@')[0]
    const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1).split('.')[0]
    const lastName = emailName.includes('.') ? emailName.split('.')[1].charAt(0).toUpperCase() + emailName.split('.')[1].slice(1) : 'User'

    return {
      success: true,
      data: {
        user: {
          id: '1',
          email: email,
          profile: {
            firstName: firstName,
            lastName: lastName,
          },
          isVerified: true,
          twoFactorEnabled: false,
        },
        tokens: {
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600,
          tokenType: 'Bearer',
        },
        session: {
          id: 'mock-session-id-' + Date.now(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      },
    }
  }

  return {
    success: false,
    error: {
      message: 'Invalid email or password. Password must be at least 8 characters.',
      code: 'INVALID_CREDENTIALS',
    },
  }
}

// Other mock API functions would go here...
async function mockLogoutApi(token: string, sessionId: string) {
  return { success: true }
}

async function mockRegisterApi(userData: any) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

async function mockRefreshTokenApi(refreshToken: string) {
  return {
    success: true,
    data: {
      tokens: {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
        expiresIn: 3600,
      },
    },
  }
}

async function mockVerifyTokenApi(token: string) {
  return { success: true }
}

// Add other mock functions as needed
async function mockSendTwoFactorCodeApi(method: string, email?: string) {
  return { success: true }
}

async function mockVerifyTwoFactorCodeApi(code: string, backupCode?: string) {
  return { success: true }
}

async function mockEnableTwoFactorApi(method: string) {
  return { success: true }
}

async function mockDisableTwoFactorApi(password: string) {
  return { success: true }
}

async function mockGenerateBackupCodesApi() {
  return {
    success: true,
    data: {
      codes: ['123456', '789012', '345678', '901234'],
    },
  }
}

async function mockForgotPasswordApi(email: string) {
  return { success: true }
}

async function mockResetPasswordApi(token: string, newPassword: string) {
  return { success: true }
}

async function mockChangePasswordApi(currentPassword: string, newPassword: string) {
  return { success: true }
}

async function mockResendVerificationApi(email?: string) {
  return { success: true }
}

async function mockVerifyEmailApi(token: string) {
  return { success: true }
}

async function mockUpdateProfileApi(updates: any) {
  return { success: true }
}

async function mockUpdatePreferencesApi(preferences: any) {
  return { success: true }
}

async function mockUploadAvatarApi(file: File) {
  return {
    success: true,
    data: { url: 'https://example.com/avatar.jpg' },
  }
}

async function mockUpdateSecuritySettingsApi(settings: any) {
  return { success: true }
}