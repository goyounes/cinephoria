import type { ReactNode } from "react";
import { Box, Button, type ButtonProps } from "@mui/material"

interface ResponsiveIconButtonProps extends ButtonProps {
  icon: ReactNode;
  children?: ReactNode;
}

const ResponsiveIconButton = ({ icon, children, ...props }: ResponsiveIconButtonProps) => {
    return (
        <Button
            startIcon={icon}
            {...props}
            sx={{
            justifyContent: 'center',
            '& .MuiButton-startIcon': {
                mr: { xs: 0, md: 1 },
            },
            ...props.sx,
            }}
            >
            <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
            {children}
            </Box>
        </Button>
    )
}

export default ResponsiveIconButton