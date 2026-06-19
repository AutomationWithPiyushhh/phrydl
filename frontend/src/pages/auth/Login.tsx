import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { motionVariants, glassClasses } from "@/lib/glass";
import { cn } from "@/lib/utils";
import { Home, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success) {
        const { token, id, role: rawRole } = response.data.data;
        const role = rawRole.replace('ROLE_', '');
        login(token, { id, email, role });
        
        if (role === 'TENANT') {
           navigate("/tenant");
        } else {
           navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA]">
      {/* Left side abstract branding - Light mode friendly */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-white items-center justify-center border-r border-gray-200">
        {/* Soft abstract shapes */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-yellow-50 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-orange-50 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10 text-center max-w-lg px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center text-accent-foreground mx-auto mb-8 shadow-2xl shadow-accent/20">
              <Home size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black mb-6 text-gray-900 tracking-tight">Manage effortlessly. <br/>Scale infinitely.</h1>
            <p className="text-lg text-gray-500 leading-relaxed">Join the most intelligent accommodation management platform built for modern operators.</p>
          </motion.div>
        </div>
      </div>

      {/* Right side login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <motion.div 
          variants={motionVariants.scaleUp}
          initial="initial"
          animate="animate"
          className={cn("w-full max-w-md p-10 rounded-3xl", glassClasses.card)}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Username or Email</Label>
              <Input 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@phrydlpg.com" 
                type="text" 
                required
                className="h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password" 
                required
                className="h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-accent"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl shadow-accent/20 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Don't have an account? <Link to="/signup" className="text-accent font-semibold hover:underline">Request Access</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
