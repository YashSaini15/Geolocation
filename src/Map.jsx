import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import darkModeStyles from "./darkModeStyle";
import googleApiKey from "./config";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useDispatch, useSelector } from "react-redux";
import { addLocation, removeLocation } from "./store/locations-slice";

const libraries = ["places"];

const mapContainerStyle = {
  position: "relative",
  width: "100vw",
  height: "100vh",
};

const center = {
  lat: 7.2905715,
  lng: 80.6337262,
};

const sidebarStyle = {
  position: "absolute",
  top: 100,
  left: 20,
  backgroundColor: "white",
  padding: "20px",
  minWidth: "24%",
  maxHeight: "60%",
  overflow: "auto",
};

export default function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleApiKey,
    libraries,
    async: true,
    onError: (error) => {
      console.error("Error loading Google Maps API:", error);
    },
  });

  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const [addButtonVisible, setAddButtonVisible] = useState(false);
  const [map, setMap] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);

  const coordinates = useSelector((state) => state.location);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoaded) {
      setMarkers(coordinates);
    }
  }, [isLoaded, coordinates]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleMapClick = (event) => {
    setClickedCoordinates({
      lat: event?.latLng.lat(),
      lng: event?.latLng.lng(),
    });
    setAddButtonVisible(true);
  };

  const handleAddLocation = () => {
    if (clickedCoordinates) {
      dispatch(addLocation(clickedCoordinates));
      setClickedCoordinates(null);
      setAddButtonVisible(false);
    }
  };

  const handleDownloadSavedLocations = () => {
    const docContent = coordinates
      .map(
        (location) => `Latitude: ${location.lat} | Longitude: ${location.lng}\n`
      )
      .join("");

    const blob = new Blob([docContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "saved_locations.psv";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRemoveLocation = (id) => {
    dispatch(removeLocation(id));
  };

  const handleShowLocation = (location) => {
    if (map) {
      map.panTo(location);
    }
  };

  const handlePlaceChange = () => {
    const place = autocomplete?.getPlace();
    if (place) {
      if (!place?.geometry || !place?.geometry.location) {
        return;
      }

      if (!map) {
        console.error("Google Map not loaded!");
        return;
      }

      const viewport = place.geometry.viewport;
      if (viewport) {
        const bounds = {
          north: viewport.getNorthEast().lat(),
          south: viewport.getSouthWest().lat(),
          east: viewport.getNorthEast().lng(),
          west: viewport.getSouthWest().lng(),
        };

        const mapBounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(bounds.south, bounds.west),
          new window.google.maps.LatLng(bounds.north, bounds.east)
        );

        map.fitBounds(mapBounds);
      }

      setSearchValue("");
    }
  };

  if (loadError) {
    return <Box>Error loading maps</Box>;
  }

  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center">
        Loading...
      </Box>
    );
  }

  return (
    <Box>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
        onClick={handleMapClick}
        onLoad={(map) => setMap(map)}
        options={darkMode ? darkModeStyles : { styles: [] }}
      >
        {markers.map((location, index) => (
          <Marker
            key={index}
            position={location}
            onClick={() => handleShowLocation()}
          />
        ))}
      </GoogleMap>
      <Box style={sidebarStyle}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          margin="10px 0px"
        >
          <Typography style={{ fontSize: "20px", fontWeight: "500" }}>
            Theme: {darkMode ? "Dark" : "Light"}
          </Typography>
          <ToggleButtonGroup
            value={darkMode ? "dark" : "light"}
            exclusive
            onChange={handleToggleDarkMode}
          >
            <ToggleButton
              style={{ padding: "5px", borderRadius: "50px 0px 0px 50px" }}
              value="light"
              aria-label="light mode"
            >
              <WbSunnyIcon style={{ fontSize: "20px" }} />
            </ToggleButton>
            <ToggleButton
              style={{ padding: "5px", borderRadius: "0px 50px 50px 0px" }}
              value="dark"
              aria-label="dark mode"
            >
              <DarkModeIcon style={{ fontSize: "20px" }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {addButtonVisible && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginBottom="20px"
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddLocation}
            >
              Add this Location
            </Button>
          </Box>
        )}
        <Autocomplete
          onLoad={(autocomplete) => setAutocomplete(autocomplete)}
          onPlaceChanged={handlePlaceChange}
        >
          <TextField
            fullWidth
            type="text"
            margin="normal"
            id="location"
            label="Search Location"
            name="location"
            variant="outlined"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </Autocomplete>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          margin="10px 0px"
        >
          <Typography style={{ fontSize: "20px", fontWeight: 600 }}>
            Saved Locations
          </Typography>
          <Box
            style={{ cursor: "pointer" }}
            onClick={handleDownloadSavedLocations}
          >
            <DownloadIcon />
          </Box>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Lat/Long</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coordinates.map((location, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box>
                    <Typography style={{ fontSize: "14px" }}>
                      Lat - {location.lat}
                    </Typography>
                    <Typography style={{ fontSize: "14px" }}>
                      Lng -{location.lng}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <IconButton
                    variant="contained"
                    color="primary"
                    onClick={() => handleShowLocation(location)}
                  >
                    <LocationSearchingIcon />
                  </IconButton>
                  <IconButton
                    variant="contained"
                    color="secondary"
                    onClick={() => handleRemoveLocation(index)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
