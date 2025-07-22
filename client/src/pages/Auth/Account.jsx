import { Card, CardContent, Container, Typography } from '@mui/material'
import React from 'react'

const Account = () => {
  return (
      <Container sx={{ flexGrow: 1, py: 4, display: "flex", flexDirection: "column" }}>

        <Typography variant="h4" align="center" gutterBottom>
            Welcome User : empty
        </Typography>

      <Card elevation={4} sx={{flexGrow: 1  }}>
        <CardContent>

        </CardContent>
      </Card>
    </Container>
  )
}

export default Account