import React from 'react'

const Account = () => {
  return (
    <Container maxWidth="sm" sx={{ flexGrow: 1 , py:4, display:'flex', flexDirection:"row", alignItems: 'center'}}>
      <Card elevation={4} sx={{flexGrow: 1  }}>
        <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
                Welcome User : "empty"
            </Typography>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Account