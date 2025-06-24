
import { Button } from "@/components/ui/button";

interface FormSubmitButtonProps {
  isLoading: boolean;
  isSignUp: boolean;
  isDisabled: boolean;
}

const FormSubmitButton = ({ isLoading, isSignUp, isDisabled }: FormSubmitButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={isDisabled}
      className="w-full arcade-button arcade-button-primary"
    >
      {isLoading ? "CARICAMENTO..." : isSignUp ? "REGISTRATI" : "ACCEDI"}
    </Button>
  );
};

export default FormSubmitButton;
