import { Button } from './button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './card.jsx';
import { useMember } from '../../integrations/index.js';

export function SignIn({ title = "Sign In", message = "Please sign in to continue", className = "" }) {
  const { actions, isLoading } = useMember();

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-secondary/70">{message}</p>
        <Button 
          onClick={actions.login} 
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </CardContent>
    </Card>
  );
}