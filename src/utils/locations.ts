export interface PredefinedLocation {
  address: string;
  latitude: number;
  longitude: number;
}

/**
 * Predefined locations used as a geocoding alternative (real geocoding is
 * optional per the assignment). Selecting one fills both address and coords.
 */
export const PREDEFINED_LOCATIONS: PredefinedLocation[] = [
  { address: '123 Main St, New York, NY', latitude: 40.7128, longitude: -74.006 },
  { address: '456 Oak Ave, Los Angeles, CA', latitude: 34.0522, longitude: -118.2437 },
  { address: '789 Pine Rd, Chicago, IL', latitude: 41.8781, longitude: -87.6298 },
  { address: '321 Elm St, Houston, TX', latitude: 29.7604, longitude: -95.3698 },
  { address: '654 Maple Dr, Phoenix, AZ', latitude: 33.4484, longitude: -112.074 },
];
