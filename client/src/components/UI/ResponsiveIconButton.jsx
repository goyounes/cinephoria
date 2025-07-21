import { Box, Button } from "@mui/material"

const ResponsiveIconButton = ({ icon, children, ...props }) => {
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