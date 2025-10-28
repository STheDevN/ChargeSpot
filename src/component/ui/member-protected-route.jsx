import React from 'react';
import PropTypes from 'prop-types';
import { useMember } from '../../integrations/index.js';
import { SignIn } from './sign-in.jsx';
import { LoadingSpinner } from './loading-spinner.jsx';

export function MemberProtectedRoute({
  children,
  messageToSignIn = "Please sign in to access this page.",
  messageToLoading = "Loading page...",
  signInTitle = "Sign In Required",
  signInClassName = "",
  loadingClassName = "",
  signInProps = {},
  loadingSpinnerProps = {}
}) {
  const { isAuthenticated, isLoading } = useMember();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner
          message={messageToLoading}
          className={loadingClassName}
          {...loadingSpinnerProps}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SignIn
          title={signInTitle}
          message={messageToSignIn}
          className={signInClassName}
          {...signInProps}
        />
      </div>
    );
  }

  return <>{children}</>;
}

MemberProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  messageToSignIn: PropTypes.string,
  messageToLoading: PropTypes.string,
  signInTitle: PropTypes.string,
  signInClassName: PropTypes.string,
  loadingClassName: PropTypes.string,
  signInProps: PropTypes.object,
  loadingSpinnerProps: PropTypes.object,
};