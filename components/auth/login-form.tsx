
// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useAuth } from "@/contexts/auth-context"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Loader2 } from "lucide-react"

// export function LoginForm() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [error, setError] = useState("")
//   const { login, isLoading } = useAuth()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError("")

//     const trimmedEmail = email.trim()

//     if (!trimmedEmail || !password) {
//       setError("Please enter both email and password")
//       return
//     }

//     const success = await login(trimmedEmail, password)

//     if (!success) {
//       // Optionally, have login(...) return an error message object and use it here
//       setError("Invalid email or password")
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
//             <span className="text-primary-foreground font-bold text-xl">V</span>
//           </div>
//           <CardTitle className="text-2xl">Renal ease CRM</CardTitle>
//           <CardDescription>Sign in to your account to continue</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 autoComplete="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 autoComplete="current-password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Sign In
//             </Button>
//           </form>
//           {/* Keep this only for demo / staging builds */}
//           {/* <div className="mt-4 text-center text-sm text-muted-foreground">
//             Demo credentials: admin@vasifytech.com / admin123
//           </div> */}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


//testing

// "use client"

// import type React from "react"
// import { useState } from "react"
// import Image from "next/image"
// import { useAuth } from "@/contexts/auth-context"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Loader2, MessageSquare, TrendingUp, Users, Zap } from "lucide-react"

// // ── Feature highlights shown on the left panel ────────────────────────────────
// const FEATURES = [
//   { icon: MessageSquare, text: "WhatsApp automation & bulk messaging" },
//   { icon: TrendingUp,    text: "Smart lead pipeline & conversion tracking" },
//   { icon: Users,         text: "Unified client & deal management" },
//   { icon: Zap,           text: "Real-time campaigns & analytics" },
// ]

// export function LoginForm() {
//   const [email,    setEmail]    = useState("")
//   const [password, setPassword] = useState("")
//   const [error,    setError]    = useState("")
//   const { login, isLoading } = useAuth()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError("")
//     const trimmed = email.trim()
//     if (!trimmed || !password) {
//       setError("Please enter both email and password")
//       return
//     }
//     const success = await login(trimmed, password)
//     if (!success) setError("Invalid email or password. Please try again.")
//   }

//   return (
//     <div className="min-h-screen flex">

//       {/* ── Left brand panel ──────────────────────────────────────────── */}
//       <div
//         className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
//         style={{ background: "linear-gradient(145deg, #075E54 0%, #128C7E 45%, #25D366 100%)" }}
//       >
//         {/* Decorative circles */}
//         <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
//           style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
//         <div className="absolute -bottom-32 -right-16 w-[480px] h-[480px] rounded-full opacity-10"
//           style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
//           style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />

//         {/* Logo */}
//         <div className="relative z-10">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
//               <Image
//                 src="/vasify-logo.jpeg"
//                 alt="Vasify logo"
//                 width={48}
//                 height={48}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <div>
//               <div className="text-white font-bold text-xl tracking-tight leading-none">VasifyTech</div>
//               <div className="text-green-200 text-xs font-medium mt-0.5">CRM Platform</div>
//             </div>
//           </div>
//         </div>

//         {/* Headline */}
//         <div className="relative z-10 space-y-8">
//           <div>
//             <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
//               Transform your<br />
//               <span className="text-green-200">WhatsApp business</span><br />
//               into a growth engine
//             </h1>
//             <p className="mt-4 text-green-100 text-base leading-relaxed max-w-sm">
//               The all-in-one CRM built for modern businesses running on WhatsApp automation, smart pipelines, and real-time insights.
//             </p>
//           </div>

//           {/* Feature list */}
//           <div className="space-y-3">
//             {FEATURES.map(({ icon: Icon, text }) => (
//               <div key={text} className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
//                   <Icon className="h-4 w-4 text-white" strokeWidth={1.8} />
//                 </div>
//                 <span className="text-green-50 text-sm font-medium">{text}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer tagline */}
//         <div className="relative z-10">
//           <p className="text-green-300 text-xs">
//             VasifyTech PVT LTD · Since 2024 · Mumbai
//           </p>
//         </div>
//       </div>

//       {/* ── Right form panel ──────────────────────────────────────────── */}
//       <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">

//         {/* Mobile logo (hidden on desktop) */}
//         <div className="flex lg:hidden items-center gap-3 mb-10">
//           <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
//             <Image
//               src="/vasify-logo.jpeg"
//               alt="Vasify logo"
//               width={40}
//               height={40}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <div>
//             <div className="font-bold text-gray-900 text-lg leading-none">VasifyTech</div>
//             <div className="text-gray-400 text-xs mt-0.5">CRM Platform</div>
//           </div>
//         </div>

//         <div className="w-full max-w-[380px]">

//           {/* Heading */}
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
//             <p className="text-gray-500 text-sm mt-1.5">Sign in to your VasifyTech CRM account</p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-5">

//             <div className="space-y-1.5">
//               <Label htmlFor="email" className="text-sm font-medium text-gray-700">
//                 Email address
//               </Label>
//               <Input
//                 id="email"
//                 type="email"
//                 autoComplete="email"
//                 placeholder="you@vasifytech.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="h-11 rounded-xl border-gray-200 focus:border-[#25D366] focus:ring-[#25D366]/20 text-sm"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <Label htmlFor="password" className="text-sm font-medium text-gray-700">
//                 Password
//               </Label>
//               <Input
//                 id="password"
//                 type="password"
//                 autoComplete="current-password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="h-11 rounded-xl border-gray-200 focus:border-[#25D366] focus:ring-[#25D366]/20 text-sm"
//               />
//             </div>

//             {error && (
//               <Alert className="border-red-200 bg-red-50 rounded-xl py-3">
//                 <AlertDescription className="text-red-600 text-sm">{error}</AlertDescription>
//               </Alert>
//             )}

//             <Button
//               type="submit"
//               disabled={isLoading}
//               className="w-full h-11 rounded-xl text-sm font-semibold text-white shadow-sm transition-all"
//               style={{
//                 background: isLoading
//                   ? "#94a3b8"
//                   : "linear-gradient(135deg, #075E54 0%, #25D366 100%)",
//               }}
//             >
//               {isLoading ? (
//                 <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</>
//               ) : (
//                 "Sign in"
//               )}
//             </Button>
//           </form>

//           {/* Divider + brand note */}
//           <div className="mt-8 pt-6 border-t border-gray-100 text-center">
//             <p className="text-xs text-gray-400">
//               Powered by{" "}
//               <span className="font-semibold text-[#075E54]">VasifyTech</span>
//               {" "}· WhatsApp Business Platform
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

//testing 2
"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MessageSquare, TrendingUp, Users, Zap, Shield, Lock } from "lucide-react"

const FEATURES = [
  { icon: MessageSquare, text: "WhatsApp automation & bulk messaging" },
  { icon: TrendingUp,    text: "Smart lead pipeline & conversion tracking" },
  { icon: Users,         text: "Unified client & deal management" },
  { icon: Zap,           text: "Real-time campaigns & analytics" },
]

export function LoginForm() {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const trimmed = email.trim()
    if (!trimmed || !password) {
      setError("Please enter both email and password")
      return
    }
    const success = await login(trimmed, password)
    if (!success) setError("Invalid email or password. Please try again.")
  }

  return (
    // Completely isolated full-screen layout — AppShell must NOT wrap this.
    // Sidebar visibility is controlled in AppShell by checking `user` from useAuth.
    <div className="min-h-screen w-full flex" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Left brand panel ────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #064E3B 0%, #065F46 35%, #059669 75%, #10B981 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)" }} />
        <div className="absolute -bottom-40 -right-20 w-[560px] h-[560px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)" }} />

        {/* Logo — icon only, no broken image */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.3)" }}
          >
            <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-tight leading-none">VasifyTech</div>
            <div className="text-emerald-200 text-[11px] font-medium mt-0.5 tracking-widest uppercase">CRM Platform</div>
          </div>
        </div>

        {/* Headline + features */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-[40px] font-bold text-white leading-[1.15] tracking-tight">
              Transform your<br />
              <span className="text-emerald-300">WhatsApp business</span><br />
              into a growth engine
            </h1>
            <p className="mt-5 text-emerald-100 text-[15px] leading-relaxed max-w-[360px]">
              The all-in-one CRM built for modern businesses running on WhatsApp automation, smart pipelines, and real-time insights.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <Icon className="h-4 w-4 text-white" strokeWidth={1.8} />
                </div>
                <span className="text-emerald-50 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <p className="text-emerald-400 text-xs">
            VasifyTech PVT LTD · Since 2024 · Mumbai · Internal use only
          </p>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6 py-12">

        {/* Mobile logo (lg hidden on desktop) */}
        <div className="flex lg:hidden items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #064E3B, #10B981)" }}
          >
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg leading-none">VasifyTech</div>
            <div className="text-gray-400 text-xs mt-0.5">CRM Platform</div>
          </div>
        </div>

        <div className="w-full max-w-[400px]">

          {/* Internal-only badge */}
          <div className="mb-6">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}
            >
              <Lock className="h-3 w-3" />
              Internal CRM · Authorised Access Only
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Sign in with your VasifyTech team credentials
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Work Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@vasifytech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 bg-white text-sm shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 bg-white text-sm shadow-sm"
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50 rounded-xl py-3">
                <AlertDescription className="text-red-600 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-sm font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              style={{ background: "linear-gradient(135deg, #064E3B 0%, #059669 60%, #10B981 100%)" }}
            >
              {isLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>
                : "Sign in to CRM"
              }
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-1">
            <p className="text-xs text-gray-400">
              This is a private internal tool. Unauthorised access is prohibited.
            </p>
            <p className="text-xs font-semibold" style={{ color: "#065F46" }}>
              VasifyTech PVT LTD · WhatsApp Business Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}