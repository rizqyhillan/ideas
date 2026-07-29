import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="SPLASMA - Sign In | IdEaS - Indonesian Education Management System"
        description="Sign in to access the SPLASMA platform, an Indonesian Education Management System, and manage your educational resources effectively."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
