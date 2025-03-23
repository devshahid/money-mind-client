import { Button } from "@mui/material";

interface ButtonProps {
  text: string;
  onClick: () => void;
}

const CustomButton: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <Button variant="contained" color="primary" fullWidth onClick={onClick}>
      {text}
    </Button>
  );
};

export default CustomButton;
