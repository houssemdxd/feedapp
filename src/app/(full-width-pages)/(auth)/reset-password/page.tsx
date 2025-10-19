import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

/**
* This page is opened via the email link: /reset-password?token=RAW_TOKEN
* ForgotPasswordForm automatically switches to reset mode when `token` is present.
*/
export default function Page() {
return <ForgotPasswordForm />;
}