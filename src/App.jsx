import { useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material'
import ContactList from './components/ContactList'
import ContactForm from './components/ContactForm'
import ImportContacts from './components/ImportContacts'

// Create a light theme for Material-UI
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  // State to manage the current view
  const [view, setView] = useState('list') // 'list', 'add', 'edit', 'import'
  const [selectedContact, setSelectedContact] = useState(null)

  // Function to switch views
  const handleViewChange = (newView, contact = null) => {
    setView(newView)
    setSelectedContact(contact)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Provides consistent base styles */}
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          bgcolor: '#f5f6fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {view === 'list' && (
          <ContactList 
            onAddNew={() => handleViewChange('add')}
            onEdit={(contact) => handleViewChange('edit', contact)}
            onImport={() => handleViewChange('import')}
          />
        )}
        {(view === 'add' || view === 'edit') && (
          <ContactForm
            contact={selectedContact}
            onBack={() => handleViewChange('list')}
          />
        )}
        {view === 'import' && (
          <ImportContacts
            onBack={() => handleViewChange('list')}
          />
        )}
      </Box>
    </ThemeProvider>
  )
}

export default App
