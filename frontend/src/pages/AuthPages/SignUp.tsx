import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="SPLASMA - Sign Up | IdEaS - Indonesian Education Management System"
        description="Sign up to access the SPLASMA platform, an Indonesian Education Management System, and manage your educational resources effectively."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
