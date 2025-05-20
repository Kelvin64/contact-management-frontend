import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
  LinearProgress,
  Link,
  Container,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
} from '@mui/icons-material'
import axios from 'axios'
import { API_URL } from '../../config'

// Sample CSV template for users to download
const sampleCSV = `First Name,Last Name,Email Address,Primary Phone Number
John,Doe,john@example.com,+1234567890
Jane,Smith,jane@example.com,+0987654321`

function ImportContacts({ onBack }) {
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    
    if (!selectedFile) {
      return
    }

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      setFile(null)
      event.target.value = null // Reset file input
      return
    }

    setFile(selectedFile)
    setError(null)
    setResult(null)
  }

  // Handle file upload and import
  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setImporting(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_URL}/contacts/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setResult(response.data)
    } catch (error) {
      console.error('Import failed:', error)
      setError(error.response?.data?.error || 'Failed to import contacts. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  // Download sample CSV template
  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts_template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
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
            Import Contacts
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Upload a CSV file containing contacts. The file should have the following columns:
          </Typography>
          <Typography component="div" sx={{ mb: 2 }}>
            <ul>
              <li>First Name</li>
              <li>Last Name</li>
              <li>Email Address</li>
              <li>Primary Phone Number</li>
            </ul>
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={handleDownloadSample}
            sx={{ mb: 2, display: 'block' }}
          >
            Download sample CSV template
          </Link>
        </Box>

        <Box sx={{ mb: 3 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="csv-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
            >
              Select CSV File
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {file.name}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {importing && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Importing contacts...
            </Typography>
          </Box>
        )}

        {result && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Import completed successfully!
            <Typography variant="body2">
              Imported: {result.imported} contacts
              {result.skipped > 0 && ` (${result.skipped} duplicates skipped)`}
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!file || importing}
          >
            Import Contacts
          </Button>
          <Button
            variant="outlined"
            onClick={onBack}
            disabled={importing}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default ImportContacts 