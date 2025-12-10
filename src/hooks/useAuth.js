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
import { syncFirebaseUserToSupabase, getCurrentUserProfile } from '../services/userService'

const AuthContext = createContext(null)

/**
 * Ambil nama pengguna (username) yang dapat digunakan dari objek user Firebase.
 * Prioritas: displayName -> email (sebelum @) -> reloadUserInfo.screenName -> providerData uid -> empty string.
 *
 * @param {import('firebase/auth').User|null|undefined} user Objek user Firebase atau null.
 * @returns {string} Nama pengguna yang dapat ditampilkan (username) atau string kosong jika tidak tersedia.
 *
 * Fungsi ini mengekstrak nama pengguna dengan beberapa mekanisme fallback agar
 * selalu ada nilai yang dapat ditampilkan pada UI walaupun beberapa properti tidak tersedia.
 */
function getUsernameFromUser(user) {
  if (!user) return ''
  if (user.displayName) return user.displayName
  if (user.email) return user.email.split('@')[0]
  if (user.reloadUserInfo?.screenName) return user.reloadUserInfo.screenName
  if (user.providerData && user.providerData[0]?.uid) return `user_${user.providerData[0].uid}`
  return ''
}

/**
 * Hook internal yang mengelola state autentikasi aplikasi.
 * Meng-handle login/register/logout, sinkronisasi ke Supabase, dan status inisialisasi.
 *
 * @returns {object} Objek yang berisi informasi user dan fungsi-fungsi autentikasi.
 *
 * Hook ini membungkus semua logika autentikasi (Firebase + sinkronisasi Supabase)
 * sehingga provider `AuthProvider` dapat memberikan API yang konsisten ke seluruh aplikasi.
 */
function useProvideAuth() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [supabaseUserId, setSupabaseUserId] = useState(null)
  const [userRole, setUserRole] = useState(null)

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
        try {
          const profile = await getCurrentUserProfile()
          setUserRole(profile?.role || 'user')
        } catch (_) {
          setUserRole(null)
        }
      } else {

        setUser(null)
        setUsername('')
        setUserEmail('')
        setSupabaseUserId(null)
        setUserRole(null)
        setIsAuthenticated(false)

      }
      setInitializing(false)
    })

    return () => unsubscribe()
  }, [])

  /**
   * Login menggunakan email & password.
   *
   * @param {string} email Alamat email pengguna.
   * @param {string} password Password pengguna.
   * @returns {Promise<{user: import('firebase/auth').User, supabaseUserId: string|null}>}
   *
   * Melakukan sign-in via Firebase, lalu memanggil layanan untuk menyinkronkan user
   * ke Supabase dan mengembalikan object yang berisi user Firebase dan id Supabase.
   */
  const loginWithEmail = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const fbUser = cred.user
    const userId = await syncFirebaseUserToSupabase(fbUser)

    setUser(fbUser)
    setUsername(getUsernameFromUser(fbUser))
    setUserEmail(fbUser.email || '')
    setSupabaseUserId(userId)
    setIsAuthenticated(true)
    try {
      const profile = await getCurrentUserProfile()
      setUserRole(profile?.role || 'user')
    } catch (_) {
      setUserRole(null)
    }
    return { user: fbUser, supabaseUserId: userId }

  }

  /**
   * Registrasi pengguna baru menggunakan email & password.
   * Jika tersedia, nama tampilan (`usernameInput`) akan diset ke profil Firebase.
   *
   * @param {string} usernameInput Nama tampilan (display name) yang diinginkan.
   * @param {string} email Alamat email baru.
   * @param {string} password Password baru.
   * @returns {Promise<{user: import('firebase/auth').User, supabaseUserId: string|null}>}
   * 
   * Membuat pengguna di Firebase, mengupdate profil jika nama diberikan,
   * lalu menyinkronkan ke Supabase dan memperbarui state lokal.
   */
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
    try {
      const profile = await getCurrentUserProfile()
      setUserRole(profile?.role || 'user')
    } catch (_) {
      setUserRole(null)
    }
    return { user: fbUser, supabaseUserId: userId }
  }

  /**
   * Login menggunakan akun Google melalui popup OAuth Firebase.
   * @returns {Promise<{user: import('firebase/auth').User, supabaseUserId: string|null}>}
   * Memanggil popup Google, menyinkronkan user ke Supabase, dan memperbarui state.
   */
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const fbUser = result.user
    const userId = await syncFirebaseUserToSupabase(fbUser)

    setUser(fbUser)
    setUsername(getUsernameFromUser(fbUser))
    setUserEmail(fbUser.email || '')
    setSupabaseUserId(userId)
    setIsAuthenticated(true)
    try {
      const profile = await getCurrentUserProfile()
      setUserRole(profile?.role || 'user')
    } catch (_) {
      setUserRole(null)
    }
    return { user: fbUser, supabaseUserId: userId }
  }

  /**
   * Login menggunakan akun GitHub melalui popup OAuth Firebase.
   * @returns {Promise<{user: import('firebase/auth').User, supabaseUserId: string|null}>}
   * Memanggil popup GitHub, menyinkronkan user ke Supabase, dan memperbarui state.
   */
  const loginWithGithub = async () => {
    const result = await signInWithPopup(auth, githubProvider)
    const fbUser = result.user
    const userId = await syncFirebaseUserToSupabase(fbUser)
    setUser(fbUser)
    setUsername(getUsernameFromUser(fbUser))
    setUserEmail(fbUser.email || '')
    setSupabaseUserId(userId)
    setIsAuthenticated(true)
    try {
      const profile = await getCurrentUserProfile()
      setUserRole(profile?.role || 'user')
    } catch (_) {
      setUserRole(null)
    }
    return { user: fbUser, supabaseUserId: userId }
  }

  /**
   * Logout pengguna saat ini dari Firebase dan mereset state autentikasi lokal.
   *
   * Melakukan signOut ke Firebase lalu membersihkan semua state terkait user.
   */
  const logout = async () => {
    await signOut(auth)

    setUser(null)
    setUsername('')
    setUserEmail('')
    setSupabaseUserId(null)
    setUserRole(null)
    setIsAuthenticated(false)
  }

  return {
    user,
    username,
    userEmail,
    supabaseUserId,
    userRole,

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

/**
 * Hook publik untuk mengakses konteks autentikasi.
 * Harus dipanggil di dalam komponen yang dibungkus `AuthProvider`.
 *
 * @returns {ReturnType<typeof useProvideAuth>} Objek autentikasi publik.
 *
 * Fungsi ini membaca konteks yang disediakan oleh `AuthProvider` dan mengembalikan
 * API autentikasi yang dapat digunakan di komponen lain (mis. `loginWithEmail`).
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }
  return ctx
}