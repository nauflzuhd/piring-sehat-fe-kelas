import { useState, useEffect, useContext, createContext, createElement } from 'react'
import { auth, googleProvider, githubProvider } from '../firebase'
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { syncFirebaseUserToSupabase } from '../services/userService'

const AuthContext = createContext(null)

function getUsernameFromUser(user) {
  if (!user) return ''
  if (user.displayName) return user.displayName
  if (user.email) return user.email.split('@')[0]
  if (user.reloadUserInfo?.screenName) return user.reloadUserInfo.screenName
  if (user.providerData && user.providerData[0]?.uid) return `user_${user.providerData[0].uid}`
  return ''
}

function useProvideAuth() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [supabaseUserId, setSupabaseUserId] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        let userId = null
        try {
          userId = await syncFirebaseUserToSupabase(fbUser)
        } catch (_) {
          // abaikan error sync saat restore session
        }
        setUser(fbUser)
        setUsername(getUsernameFromUser(fbUser))
        setUserEmail(fbUser.email || '')
        setSupabaseUserId(userId)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setUsername('')
        setUserEmail('')
        setSupabaseUserId(null)
        setIsAuthenticated(false)
      }
      setInitializing(false)
    })

    return () => unsubscribe()
  }, [])

  const loginWithEmail = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const fbUser = cred.user
    const userId = await syncFirebaseUserToSupabase(fbUser)
    setUser(fbUser)
    setUsername(getUsernameFromUser(fbUser))
    setUserEmail(fbUser.email || '')
    setSupabaseUserId(userId)
    setIsAuthenticated(true)
    return { user: fbUser, supabaseUserId: userId }
  }

  const registerWithEmail = async (usernameInput, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const fbUser = cred.user
    if (usernameInput) {
      await updateProfile(fbUser, { displayName: usernameInput })
    }
    const userId = await syncFirebaseUserToSupabase(fbUser)
    setUser(fbUser)
    setUsername(getUsernameFromUser(fbUser))
    setUserEmail(fbUser.email || '')
    setSupabaseUserId(userId)
    setIsAuthenticated(true)
    return { user: fbUser, supabaseUserId: userId }
  }

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const fbUser = result.user
    const userId = await syncFirebaseUserToSupabase(fbUser)
    setUser(fbUser)
    setUsername(getUsernameFromUser(fbUser))
    setUserEmail(fbUser.email || '')
    setSupabaseUserId(userId)
    setIsAuthenticated(true)
    return { user: fbUser, supabaseUserId: userId }
  }

  const loginWithGithub = async () => {
    const result = await signInWithPopup(auth, githubProvider)
    const fbUser = result.user
    const userId = await syncFirebaseUserToSupabase(fbUser)
    setUser(fbUser)
    setUsername(getUsernameFromUser(fbUser))
    setUserEmail(fbUser.email || '')
    setSupabaseUserId(userId)
    setIsAuthenticated(true)
    return { user: fbUser, supabaseUserId: userId }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setUsername('')
    setUserEmail('')
    setSupabaseUserId(null)
    setIsAuthenticated(false)
  }

  return {
    user,
    username,
    userEmail,
    supabaseUserId,
    isAuthenticated,
    initializing,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginWithGithub,
    logout,
  }
}

export function AuthProvider({ children }) {
  const authValue = useProvideAuth()
  return createElement(AuthContext.Provider, { value: authValue }, children)
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }
  return ctx
}
