"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import {
  TextField,
  Button,
  List,
  ListItemButton,
  Typography,
  Container,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  type SelectChangeEvent,
  Paper,
} from "@mui/material"
import { getSuggestions } from "@/lib/api"
import { type ApiType, API_TYPES } from "@/types/api"
import debounce from "lodash/debounce"
import SearchResults from "./SearchResults"

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_RANGE = 20

interface SearchLandingProps {
  onSearch: (results: any[]) => void;
}

export default function SearchLanding({ onSearch }: SearchLandingProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedApi, setSelectedApi] = useState<ApiType>("semantic_scholar")
  const [selectedYear, setSelectedYear] = useState<number | 0>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  

  const router = useRouter()

  const years = Array.from({ length: YEAR_RANGE }, (_, i) => CURRENT_YEAR - i)

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (query.trim()) {
  //     const searchParams = new URLSearchParams();
  //     searchParams.set('q', query);
  //     searchParams.set('api', selectedApi);
  //     if (selectedYear !== 0) {
  //       searchParams.set('year', selectedYear.toString());
  //     }
  //     router.push(`/search?${searchParams.toString()}`);
  //   }
  // };
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/search_papers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            year: selectedYear,
            api: selectedApi,
          }),
        })
        const data = await response.json()
        setSearchResults(data.papers)
      } catch (error) {
        console.error('Error searching papers:', error)
        setError('Failed to search papers. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const fetchSuggestions = debounce(async (value: string) => {
    if (value.length >= 3) {
      try {
        setIsLoading(true)
        const { suggestions } = await getSuggestions(value, selectedApi)
        setSuggestions(suggestions)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setError("Failed to fetch suggestions. Please try again.")
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    } else {
      setSuggestions([])
    }
  }, 300)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setError(null)
    fetchSuggestions(value)
  }

  const handleApiChange = (event: SelectChangeEvent<ApiType>) => {
    const value = event.target.value as ApiType
    setSelectedApi(value)
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0071c5 0%, #004f8a 100%)",
        pt: { xs: 4, md: 8 },
        pb: { xs: 20, md: 24 },
        px: 2,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          mt: { xs: 4, md: 8 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 800,
            mx: "auto",
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              fontSize: { xs: "2.5rem", md: "3.75rem" },
              mb: 2,
              color: "#ffffff",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Research Paper Assistant
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: 400,
              mb: 6,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
              color: "#ffffff",
              opacity: 0.9,
            }}
          >
            Discover and explore academic papers with ease
          </Typography>

          <Box
            component="form"
            onSubmit={handleSearch}
            noValidate
            sx={{
              width: "100%",
              backdropFilter: "blur(8px)",
              borderRadius: 2,
              p: { xs: 2, md: 3 },
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="api-select-label" sx={{ color: "white" }}>
                    Select API
                  </InputLabel>
                  <Select
                    labelId="api-select-label"
                    value={selectedApi}
                    label="Select API"
                    onChange={handleApiChange}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                      },
                    }}
                  >
                    {API_TYPES.map((api) => (
                      <MenuItem key={api} value={api}>
                        {api.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="year-select-label" sx={{ color: "grey" }}>
                    Publication Year
                  </InputLabel>
                  <Select
                    labelId="year-select-label"
                    value={selectedYear}
                    label="Publication Year"
                    onChange={(e) => setSelectedYear(e.target.value as number | 0)}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                      },
                    }}
                  >
                    <MenuItem value="">Any Year</MenuItem>
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ position: "relative" }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search for research papers..."
                value={query}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        borderRadius: "0 4px 4px 0",
                        height: "100%",
                        minWidth: "56px",
                        backgroundColor: "#0071c5",
                        "&:hover": {
                          backgroundColor: "#004f8a",
                        },
                      }}
                    >
                      <Search />
                    </Button>
                  ),
                }}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                  },
                  borderRadius: "4px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: "transparent",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0071c5",
                    },
                  },
                }}
              />

              {suggestions.length > 0 && (
                <Paper
                  elevation={3}
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    mt: 0.5,
                    maxHeight: "300px",
                    overflowY: "auto",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <List disablePadding>
                    {suggestions.map((suggestion, index) => (
                      <ListItemButton
                        key={index}
                        onClick={() => {
                          setQuery(suggestion)
                          setSuggestions([])
                        }}
                        sx={{
                          py: 1.5,
                          px: 2,
                          "&:hover": {
                            backgroundColor: "rgba(0, 113, 197, 0.08)",
                          },
                          borderBottom: index < suggestions.length - 1 ? "1px solid rgba(0, 0, 0, 0.08)" : "none",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "text.primary",
                            fontSize: "0.95rem",
                            width: "100%",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {suggestion}
                        </Typography>
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>

            {error && <Typography sx={{ mt: 2, color: "#ff3d00" }}>{error}</Typography>}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
