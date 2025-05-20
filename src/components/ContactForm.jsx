import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Stack,
  Container,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import axios from 'axios'
import { API_URL } from '../../config'

function ContactForm({ contact, onBack }) {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    primaryPhone: '',
    additionalPhones: [],
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load contact data if editing
  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        primaryPhone: contact.primaryPhone || '',
        additionalPhones: contact.additionalPhones || [],
      })
    }
  }, [contact])

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Add a new phone number field
  const handleAddPhone = () => {
    setFormData(prev => ({
      ...prev,
      additionalPhones: [
        ...prev.additionalPhones,
        { number: '', type: 'mobile' }
      ]
    }))
  }

  // Remove a phone number field
  const handleRemovePhone = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalPhones: prev.additionalPhones.filter((_, i) => i !== index)
    }))
  }

  // Update additional phone number
  const handlePhoneChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalPhones: prev.additionalPhones.map((phone, i) => 
        i === index ? { ...phone, [field]: value } : phone
      )
    }))
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = 'Phone number is required'
    }

    // Check for duplicate phones within the form
    const allPhones = [
      { number: formData.primaryPhone, type: 'primary' },
      ...formData.additionalPhones
    ]
    const seen = new Set()
    for (const phone of allPhones) {
      const key = phone.number.trim()
      if (seen.has(key)) {
        newErrors.primaryPhone = 'Duplicate phone numbers are not allowed'
        break
      }
      seen.add(key)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const data = {
        ...formData,
        additionalPhones: formData.additionalPhones.filter(phone => phone.number.trim() !== '')
      }

      if (contact) {
        // Update existing contact
        await axios.put(`${API_URL}/contacts/${contact.ID}`, data)
      } else {
        // Create new contact
        await axios.post(`${API_URL}/contacts`, data)
      }
      onBack() // Go back to list view
    } catch (error) {
      console.error('Failed to save contact:', error)
      const errorMessage = error.response?.data?.error || 'Failed to save contact. Please try again.'
      
      // Handle specific error messages
      if (errorMessage.includes('phone number already exists')) {
        setErrors(prev => ({
          ...prev,
          primaryPhone: 'This phone number is already in use by another contact'
        }))
      } else {
        alert(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />

            <TextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
            />

            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              required
            />

            <TextField
              name="primaryPhone"
              label="Primary Phone Number"
              value={formData.primaryPhone}
              onChange={handleChange}
              error={!!errors.primaryPhone}
              helperText={errors.primaryPhone}
              required
              inputProps={{
                pattern: '[0-9+()-]*',
                title: 'Enter a valid phone number'
              }}
            />

            {/* Additional Phone Numbers */}
            {formData.additionalPhones.map((phone, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label={`Additional Phone ${index + 1}`}
                  value={phone.number}
                  onChange={(e) => handlePhoneChange(index, 'number', e.target.value)}
                  error={!!errors[`additionalPhone${index}`]}
                  helperText={errors[`additionalPhone${index}`]}
                  inputProps={{
                    pattern: '[0-9+()-]*',
                    title: 'Enter a valid phone number'
                  }}
                />
                <TextField
                  sx={{ width: '150px' }}
                  select
                  SelectProps={{ native: true }}
                  value={phone.type}
                  onChange={(e) => handlePhoneChange(index, 'type', e.target.value)}
                >
                  <option value="mobile">Mobile</option>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                </TextField>
                <IconButton 
                  color="error" 
                  onClick={() => handleRemovePhone(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              type="button"
              startIcon={<AddIcon />}
              onClick={handleAddPhone}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Phone Number
            </Button>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Contact'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={onBack}
              >
                Cancel
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}

export default ContactForm 