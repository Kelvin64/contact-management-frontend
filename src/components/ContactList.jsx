import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Container,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import axios from 'axios'

const API_URL = 'http://localhost:8080/api'

function ContactList({ onAddNew, onEdit, onImport }) {
  const [contacts, setContacts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)

  // Load contacts when component mounts
  useEffect(() => {
    loadContacts()
  }, [])

  // Function to load contacts from the API
  const loadContacts = async () => {
    try {
      const response = await axios.get(`${API_URL}/contacts`)
      setContacts(response.data)
    } catch (error) {
      console.error('Failed to load contacts:', error)
      alert('Failed to load contacts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Function to delete a contact
  const handleDelete = async (ID) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return
    }

    try {
      await axios.delete(`${API_URL}/contacts/${ID}`)
      loadContacts() // Reload the list
    } catch (error) {
      console.error('Failed to delete contact:', error)
      alert('Failed to delete contact. Please try again.')
    }
  }

  // Function to view a contact's details
  const handleView = async (contact) => {
    try {
      const response = await axios.get(`${API_URL}/contacts/${contact.ID}`)
      setSelectedContact(response.data)
      setViewOpen(true)
    } catch (error) {
      alert('Failed to load contact details.')
    }
  }

  const handleCloseView = () => {
    setViewOpen(false)
    setSelectedContact(null)
  }

  // Function to format phone numbers for display
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    // Remove all non-numeric characters for display
    return phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  // Function to render phone numbers in the table
  const renderPhoneNumbers = (contact) => {
    const phones = [
      { number: contact.primaryPhone, type: 'Primary' },
      ...(contact.additionalPhones || []).map(phone => ({
        number: phone.number,
        type: phone.type.charAt(0).toUpperCase() + phone.type.slice(1)
      }))
    ];

    return (
      <Box>
        {phones.map((phone, idx) => (
          <Typography key={idx} variant="body2" sx={{ mb: idx < phones.length - 1 ? 0.5 : 0 }}>
            {formatPhoneDisplay(phone.number)} ({phone.type})
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="md" disableGutters>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: '1000px',
          maxWidth: '100%',
          minHeight: 400,
          maxHeight: 600,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={600}>
            Contacts
          </Typography>
          <Box>
            <Button variant="contained" startIcon={<AddIcon />} sx={{ mr: 1 }} onClick={onAddNew}>
              Add Contact
            </Button>
            <Button variant="outlined" startIcon={<UploadIcon />} onClick={onImport}>
              Import CSV
            </Button>
          </Box>
        </Stack>
        <TextField
          fullWidth
          placeholder="Search contacts..."
          sx={{ mb: 3 }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TableContainer sx={{ flex: 1, overflowY: 'auto', maxHeight: 350 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Numbers</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No contacts found.
                  </TableCell>
                </TableRow>
              ) : (
                contacts
                  .filter(contact =>
                    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contact.primaryPhone.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(contact => (
                    <TableRow key={contact.ID}>
                      <TableCell>{contact.firstName} {contact.lastName}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{formatPhoneDisplay(contact.primaryPhone)} (Primary)</TableCell>
                      <TableCell>
                        <IconButton color="info" onClick={() => handleView(contact)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton color="primary" onClick={() => onEdit(contact)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(contact.ID)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Contact Details Modal */}
      <Dialog 
        open={viewOpen} 
        onClose={handleCloseView} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            minWidth: '400px',
            maxWidth: '600px'
          }
        }}
      >
        <DialogTitle>Contact Details</DialogTitle>
        <DialogContent>
          {selectedContact && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedContact.firstName} {selectedContact.lastName}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1" gutterBottom>{selectedContact.email}</Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Phone Numbers</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Primary:</strong> {formatPhoneDisplay(selectedContact.primaryPhone)}
                  </Typography>
                  
                  {selectedContact.additionalPhones && selectedContact.additionalPhones.length > 0 ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Additional Numbers:
                      </Typography>
                      {selectedContact.additionalPhones.map((phone, idx) => (
                        <Typography key={idx} variant="body1" gutterBottom>
                          {formatPhoneDisplay(phone.number)} ({phone.type})
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No additional phone numbers
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ContactList 