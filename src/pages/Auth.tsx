import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { Code2 } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">CodeSphere</span>
          </div>
          <p className="text-sm text-muted-foreground">Collaborative C++ Code Editor</p>
        </div>

        <div className="flex justify-center">
          {isLogin ? (
            <SignIn
              routing="hash"
              signUpUrl="#"
              afterSignInUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-card border-border/50 shadow-none",
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              signInUrl="#"
              afterSignUpUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-card border-border/50 shadow-none",
                },
              }}
            />
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
