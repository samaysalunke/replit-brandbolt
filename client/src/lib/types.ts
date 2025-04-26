import { Profile } from '../../../shared/schema';

/**
 * LinkedIn Profile API response structure
 */
export interface LinkedInProfileResponse {
  profile: Profile;
}

/**
 * LinkedIn error response
 */
export interface LinkedInErrorResponse {
  error: string;
  details?: string;
}

/**
 * LinkedIn Raw Profile Data from LinkedIn API
 */
export interface LinkedInRawProfile {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  profilePicture?: {
    displayImage?: string;
  };
  vanityName?: string;
  // Add any other LinkedIn profile fields as needed
}