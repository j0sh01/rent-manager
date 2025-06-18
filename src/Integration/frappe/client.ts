import axios from 'axios';

export const FRAPPE_BASE_URL = 'http://localhost:8000'; 
const CLIENT_ID = '6qqbee8sj8';
const REDIRECT_URI = 'http://localhost:8080/auth/callback'; 

// Helper function to format image URLs from Frappe
export function formatFrappeImageUrl(imagePath: string | undefined): string | undefined {
  if (!imagePath) return undefined;
  // If the image path already includes the base URL, return it as is
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise, prepend the Frappe base URL
  return `${FRAPPE_BASE_URL}${imagePath}`;
}

export const authorizeUrl = `${FRAPPE_BASE_URL}/api/method/frappe.integrations.oauth2.authorize`;

export function getAuthorizeUrl(state: string, scope = 'openid all') {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    state,
    response_type: 'code',
    scope,
    redirect_uri: REDIRECT_URI,
  });

  return `${authorizeUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, codeVerifier?: string) {
  const data: Record<string, string> = {
    grant_type: 'authorization_code',
    code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
  };

  if (codeVerifier) {
    data.code_verifier = codeVerifier;
  }

  const response = await axios.post(`${FRAPPE_BASE_URL}/api/method/frappe.integrations.oauth2.get_token`, new URLSearchParams(data), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
  });

  return response.data;
}

export async function fetchUserProfile(accessToken: string) {
  const response = await axios.get(`${FRAPPE_BASE_URL}/api/method/frappe.integrations.oauth2.openid_profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function getProperties(accessToken: string) {
  try {
    console.log('Fetching properties with token:', accessToken);
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/method/rents.rental_management_system.api.get_properties`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    console.log('Properties API response:', response.data);
    return (response.data as { message: any }).message;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}

export async function getTotalRentPaid(accessToken: string) {
  try {
    console.log('Fetching total rent paid with token:', accessToken);
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/method/rents.rental_management_system.api.get_total_rent_paid_all`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    console.log('Total rent paid API response:', response.data);
    return (response.data as { message: any }).message || 0;
  } catch (error) {
    console.error('Error fetching total rent paid:', error);
    return 0;
  }
}

export async function getPendingRent(accessToken: string) {
  try {
    console.log('Fetching pending rent with token:', accessToken);
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/method/rents.rental_management_system.api.get_pending_rent`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    console.log('Pending rent API response:', response.data);
    return (response.data as { message: any }).message || 0;
  } catch (error) {
    console.error('Error fetching pending rent:', error);
    return 0;
  }
}

export async function getAllPayments(accessToken: string) {
  try {
    console.log('Fetching all payments with token:', accessToken);
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/method/rents.rental_management_system.api.get_all_payments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    console.log('All payments API response:', response.data);
    return (response.data as { message: any }).message || [];
  } catch (error) {
    console.error('Error fetching all payments:', error);
    
    // Log more details about the error
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
      console.error('Response headers:', axiosError.response?.headers);
    }
    
    return [];
  }
}

export async function getPaymentsByRental(accessToken: string, rentalId: string) {
  try {
    console.log('Fetching payments for rental:', rentalId);
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Payment`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        filters: JSON.stringify([['rental', '=', rentalId]]),
        fields: JSON.stringify([
          "name", "rental", "payment_date", "tenant", 
          "amount_tzs", "payment_method", "start_date", "end_date",
          "docstatus", "creation", "modified"
        ]),
        limit_page_length: 1000
      }
    });
    
    console.log('Payments by rental API response:', response.data);
    return (response.data as any).data || [];
  } catch (error) {
    console.error('Error fetching payments by rental:', error);
    
    // Log more details about the error
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
    }
    
    return [];
  }
}

export async function getRentalsByTenant(accessToken: string, tenantId: string) {
  try {
    console.log('Fetching rentals for tenant:', tenantId);
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Rental`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        filters: JSON.stringify([['tenant', '=', tenantId]]),
        fields: JSON.stringify([
          "name", "property", "property_name", "tenant", "tenant_name",
          "status", "frequency", "monthly_rent_tzs", "start_date", "end_date",
          "total_rent_tzs", "docstatus", "creation", "modified"
        ]),
        limit_page_length: 1000
      }
    });
    
    console.log('Rentals by tenant API response:', response.data);
    return (response.data as any).data || [];
  } catch (error) {
    console.error('Error fetching rentals by tenant:', error);
    
    // Log more details about the error
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
    }
    
    return [];
  }
}

export async function createPayment(accessToken: string, paymentData: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('Creating payment with data:', paymentData);
    
    const response = await fetch(`${FRAPPE_BASE_URL}/api/resource/Payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: paymentData
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to create payment');
    }

    console.log('Payment created successfully:', responseData);
    return { success: true, data: responseData.data };
    
  } catch (error) {
    console.error('Error creating payment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create payment' };
  }
}

export async function updateRentalStatus(accessToken: string, rentalName: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Updating rental status:', rentalName, 'to', status);
    
    const response = await fetch(`${FRAPPE_BASE_URL}/api/resource/Rental/${rentalName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: { status: status }
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update rental status');
    }

    console.log('Rental status updated successfully:', responseData);
    return { success: true };
    
  } catch (error) {
    console.error('Error updating rental status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update rental status' };
  }
}

// Helper function to upload a file to Frappe and get the file URL
async function uploadFileToFrappe(accessToken: string, fileData: { filename: string; content: string }, attachedToName?: string): Promise<string | null> {
  try {
    console.log('📤 Uploading file to Frappe:', fileData.filename, 'attached to:', attachedToName || 'None');
    
    // Create form data for file upload
    const formData = new FormData();
    
    // Convert base64 to blob
    const byteCharacters = atob(fileData.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    formData.append('file', blob, fileData.filename);
    formData.append('doctype', 'Property');
    formData.append('fieldname', 'image');
    formData.append('is_private', '0');
    formData.append('from_form', '1');
    
    // Don't attach to document initially - upload as standalone file
    // We'll update the Property document with the file URL separately
    
    console.log('📤 Form data prepared:', {
      filename: fileData.filename,
      doctype: 'Property',
      fieldname: 'image',
      is_private: '0',
      from_form: '1',
      blobSize: blob.size,
      blobType: blob.type
    });
    
    const response = await fetch(`${FRAPPE_BASE_URL}/api/method/upload_file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });
    
    console.log('📤 Upload response status:', response.status);
    console.log('📤 Upload response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ File upload failed:', response.status, errorText);
      
      // Try alternative upload method if 417 error
      if (response.status === 417) {
        console.log('🔄 Trying alternative upload method...');
        return await uploadFileAlternative(accessToken, fileData);
      }
      
      return null;
    }
    
    const responseData = await response.json();
    console.log('📤 File upload response:', responseData);
    
    if (responseData && responseData.message && responseData.message.file_url) {
      console.log('✅ File uploaded successfully:', responseData.message.file_url);
      return responseData.message.file_url;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    return null;
  }
}

// Alternative upload method using different approach
async function uploadFileAlternative(accessToken: string, fileData: { filename: string; content: string }): Promise<string | null> {
  try {
    console.log('🔄 Trying alternative upload method for:', fileData.filename);
    
    // Try using axios with different content type
    const axios = (await import('axios')).default;
    
    // Convert base64 to blob
    const byteCharacters = atob(fileData.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('file', blob, fileData.filename);
    formData.append('doctype', 'Property');
    formData.append('fieldname', 'image');
    formData.append('is_private', '0');
    formData.append('from_form', '1');
    
    // Don't attach to document initially - upload as standalone file
    
    const response = await axios.post(`${FRAPPE_BASE_URL}/api/method/upload_file`, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('🔄 Alternative upload response:', response.data);
    
    const responseData = response.data as any;
    if (responseData && responseData.message && responseData.message.file_url) {
      console.log('✅ Alternative upload successful:', responseData.message.file_url);
      return responseData.message.file_url;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Alternative upload failed:', error);
    return null;
  }
}

export async function createProperty(accessToken: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('Creating property with token:', accessToken);
    console.log('Create data:', data);
    
    // Prepare property data without images first
    const propertyData = { ...data };
    
    // Remove image fields from initial creation
    delete propertyData.image;
    delete propertyData.image_1;
    delete propertyData.image_2;
    delete propertyData.image_3;
    delete propertyData.image_4;
    
    console.log('Initial property data (without images):', propertyData);
    
    // Create the property first
    const createResponse = await fetch(`${FRAPPE_BASE_URL}/api/resource/Property`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: propertyData
      })
    });
    
    const createResponseData = await createResponse.json();
    console.log('Property creation API response:', createResponseData);
    
    if (!createResponse.ok) {
      const errorMsg = createResponseData.message || createResponseData._server_messages || 'Failed to create property';
      console.error('Create error:', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    // Get the created property name
    const createdPropertyName = createResponseData.data.name;
    console.log('✅ Property created successfully with name:', createdPropertyName);
    
    // Now upload files and update the property
    const updateData: any = {};
    
    // Upload files and collect URLs
    if (data.image && typeof data.image === 'object' && data.image.content) {
      console.log('🖼️ Uploading main image...');
      const fileUrl = await uploadFileToFrappe(accessToken, data.image);
      if (fileUrl) {
        updateData.image = fileUrl;
        console.log('✅ Main image uploaded:', fileUrl);
      } else {
        console.log('❌ Failed to upload main image');
      }
    }
    
    if (data.image_1 && typeof data.image_1 === 'object' && data.image_1.content) {
      console.log('🖼️ Uploading image 1...');
      const fileUrl = await uploadFileToFrappe(accessToken, data.image_1);
      if (fileUrl) {
        updateData.image_1 = fileUrl;
        console.log('✅ Image 1 uploaded:', fileUrl);
      } else {
        console.log('❌ Failed to upload image 1');
      }
    }
    
    if (data.image_2 && typeof data.image_2 === 'object' && data.image_2.content) {
      console.log('🖼️ Uploading image 2...');
      const fileUrl = await uploadFileToFrappe(accessToken, data.image_2);
      if (fileUrl) {
        updateData.image_2 = fileUrl;
        console.log('✅ Image 2 uploaded:', fileUrl);
      } else {
        console.log('❌ Failed to upload image 2');
      }
    }
    
    if (data.image_3 && typeof data.image_3 === 'object' && data.image_3.content) {
      console.log('🖼️ Uploading image 3...');
      const fileUrl = await uploadFileToFrappe(accessToken, data.image_3);
      if (fileUrl) {
        updateData.image_3 = fileUrl;
        console.log('✅ Image 3 uploaded:', fileUrl);
      } else {
        console.log('❌ Failed to upload image 3');
      }
    }
    
    if (data.image_4 && typeof data.image_4 === 'object' && data.image_4.content) {
      console.log('🖼️ Uploading image 4...');
      const fileUrl = await uploadFileToFrappe(accessToken, data.image_4);
      if (fileUrl) {
        updateData.image_4 = fileUrl;
        console.log('✅ Image 4 uploaded:', fileUrl);
      } else {
        console.log('❌ Failed to upload image 4');
      }
    }
    
    // Update the property with file URLs if any files were uploaded
    if (Object.keys(updateData).length > 0) {
      console.log('🔄 Updating property with file URLs:', updateData);
      
      const updateResponse = await fetch(`${FRAPPE_BASE_URL}/api/resource/Property/${createdPropertyName}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: updateData
        })
      });
      
      const updateResponseData = await updateResponse.json();
      console.log('Property update with images API response:', updateResponseData);
      
      if (!updateResponse.ok) {
        console.log('⚠️ Property created but image update failed:', updateResponseData.message);
        // Still return success since the property was created
      }
    }
    
    return { success: true, data: createResponseData.data };
  } catch (error) {
    console.error('Error creating property:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function updateProperty(accessToken: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('Updating property with token:', accessToken);
    console.log('Update data:', data);
    
    // Extract name from data
    const { name, ...propertyData } = data;
    
    // Validate name parameter
    if (!name || typeof name !== 'string' || name.trim() === '') {
      console.error('❌ Invalid property name:', name);
      return { success: false, error: 'Invalid property name' };
    }
    
    const propertyName = name.trim();
    console.log('✅ Valid property name:', propertyName);
    
    // Separate file objects from other data
    const filesToUpload: any = {};
    const dataToUpdate: any = {};
    
    // Process each field
    Object.keys(propertyData).forEach(key => {
      const value = propertyData[key];
      
      // If it's a File object, prepare it for upload
      if (value instanceof File) {
        filesToUpload[key] = value;
        console.log(`📁 File object found for ${key}:`, value.name);
      } 
      // If it's a string (URL) or other valid type, include it in the update
      else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        dataToUpdate[key] = value;
        console.log(`✅ Valid data for ${key}:`, value);
      }
      // If it's undefined/null, skip it
      else if (value === undefined || value === null) {
        console.log(`⏭️ Skipping ${key}: undefined/null`);
      }
      // If it's an object (like file data), skip it
      else {
        console.log(`⏭️ Skipping ${key}: invalid type`, typeof value);
      }
    });
    
    console.log('Files to upload:', Object.keys(filesToUpload));
    console.log('Data to update:', dataToUpdate);
    
    // Upload files first and get URLs
    for (const [fieldName, file] of Object.entries(filesToUpload)) {
      console.log(`🖼️ Uploading ${fieldName}...`);
      
      // Convert File to the format expected by uploadFileToFrappe
      const fileData = await fileToBase64(file as File);
      const uploadData = {
        filename: (file as File).name,
        content: fileData.split(',')[1] // Remove the data:image/jpeg;base64, prefix
      };
      
      const fileUrl = await uploadFileToFrappe(accessToken, uploadData);
      if (fileUrl) {
        dataToUpdate[fieldName] = fileUrl;
        console.log(`✅ ${fieldName} uploaded:`, fileUrl);
      } else {
        console.log(`❌ Failed to upload ${fieldName}`);
      }
    }
    
    console.log('Final data to update:', dataToUpdate);
    
    // Only update if we have data to update
    if (Object.keys(dataToUpdate).length === 0) {
      console.log('⚠️ No valid data to update');
      return { success: true, data: null };
    }
    
    const response = await fetch(`${FRAPPE_BASE_URL}/api/resource/Property/${propertyName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: dataToUpdate
      })
    });
    
    const responseData = await response.json();
    console.log('Property update API response:', responseData);
    
    if (!response.ok) {
      const errorMsg = responseData.message || responseData._server_messages || 'Failed to update property';
      console.error('Update error:', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    return { success: true, data: responseData.data };
  } catch (error) {
    console.error('Error updating property:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export async function getRentals(accessToken: string, filters?: any) {
  try {
    console.log('Fetching rentals with token:', accessToken);
    console.log('Filters:', filters);
    
    // Try the custom API method first
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/method/rents.rental_management_system.api.get_rentals`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        filters: filters ? JSON.stringify(filters) : undefined
      }
    });
    
    console.log('Rentals API response status:', response.status);
    console.log('Rentals API response headers:', response.headers);
    console.log('Rentals API full response:', response.data);
    console.log('Rentals API message field:', (response.data as any).message);
    
    const result = (response.data as { message: any }).message;
    
    // Check if we got the DocType definition instead of rental data
    if (result && result.doctype === 'DocType' && result.name === 'Rental') {
      console.log('⚠️ Got DocType definition instead of rental data, trying standard resource API...');
      return await getRentalsFromResourceAPI(accessToken, filters);
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching rentals:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
    }
    
    // Fallback to standard resource API
    console.log('🔄 Falling back to standard resource API...');
    return await getRentalsFromResourceAPI(accessToken, filters);
  }
}

async function getRentalsFromResourceAPI(accessToken: string, filters?: any) {
  try {
    console.log('📡 Using standard Frappe resource API for rentals...');
    
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Rental`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        fields: JSON.stringify([
          "name", "property", "property_name", 
          "tenant", "tenant_name", "status",
          "frequency", "monthly_rent_tzs", 
          "start_date", "end_date", "total_rent_tzs",
          "docstatus"
        ]),
        filters: filters ? JSON.stringify(filters) : undefined,
        limit_page_length: 1000
      }
    });
    
    console.log('Standard API response:', response.data);
    
    // Transform the data to match our expected format
    const rentals = (response.data as any).data || [];
    const enhancedRentals = [];
    
    for (const rental of rentals) {
      const enhancedRental = { ...rental };
      
      // Get property details if property exists
      if (rental.property) {
        try {
          const propertyResponse = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Property/${rental.property}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          });
          
          const propertyDoc = (propertyResponse.data as any).data;
          enhancedRental.property_details = {
            title: propertyDoc.title,
            location: propertyDoc.location,
            bedrooms: propertyDoc.bedrooms,
            bathroom: propertyDoc.bathroom,
            square_meters: propertyDoc.square_meters,
            image: propertyDoc.image
          };
        } catch (error) {
          console.log('Could not fetch property details for:', rental.property);
        }
      }
      
      // Get tenant details if tenant exists
      if (rental.tenant) {
        try {
          const tenantResponse = await axios.get(`${FRAPPE_BASE_URL}/api/resource/User/${rental.tenant}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          });
          
          const tenantDoc = (tenantResponse.data as any).data;
          enhancedRental.tenant_details = {
            full_name: tenantDoc.full_name,
            email: tenantDoc.email,
            phone: tenantDoc.phone,
            user_image: tenantDoc.user_image
          };
        } catch (error) {
          console.log('Could not fetch tenant details for:', rental.tenant);
        }
      }
      
      // Add status context
      enhancedRental.status_context = {
        'Active': 'green',
        'Expired': 'red',
        'Terminated': 'orange'
      }[rental.status] || 'gray';
      
      // Format dates from DD-MM-YYYY to YYYY-MM-DD
      if (rental.start_date && typeof rental.start_date === 'string') {
        if (rental.start_date.includes('-') && rental.start_date.split('-').length === 3) {
          const [day, month, year] = rental.start_date.split('-');
          if (day && month && year) {
            enhancedRental.start_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
      }
      
      if (rental.end_date && typeof rental.end_date === 'string') {
        if (rental.end_date.includes('-') && rental.end_date.split('-').length === 3) {
          const [day, month, year] = rental.end_date.split('-');
          if (day && month && year) {
            enhancedRental.end_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
      }
      
      enhancedRentals.push(enhancedRental);
    }
    
    return {
      message: "Rentals fetched successfully",
      rentals: enhancedRentals,
      total_count: enhancedRentals.length
    };
    
  } catch (error) {
    console.error('Error fetching rentals from resource API:', error);
    throw error;
  }
}

export async function downloadRentalPDF(accessToken: string, rentalName: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📄 Downloading PDF for rental:', rentalName);
    
    // First, let's check if the print format exists
    let printFormatExists = false;
    let printFormatName = 'Rental Agreement';
    try {
      const printFormatResponse = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Print Format/Rental Agreement`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      console.log('✅ Print format found:', printFormatResponse.data);
      printFormatExists = true;
      // Use the exact name from the response
      printFormatName = (printFormatResponse.data as any).data.name;
      console.log('📋 Using print format name:', printFormatName);
      
      // Test the print format to see if it's accessible
      try {
        const testResponse = await axios.get(`${FRAPPE_BASE_URL}/api/method/frappe.utils.print_format.get_html`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            doctype: 'Rental',
            name: rentalName,
            print_format: printFormatName
          }
        });
        console.log('✅ Print format test successful:', testResponse.status);
      } catch (testError) {
        console.log('⚠️ Print format test failed:', testError);
      }
    } catch (printFormatError) {
      console.log('⚠️ Print format "Rental Agreement" not found, creating it...');
      const createResult = await createRentalAgreementPrintFormat(accessToken);
      if (createResult.success) {
        printFormatExists = true;
        printFormatName = 'Rental Agreement';
        console.log('✅ Rental Agreement print format created successfully');
      } else {
        console.log('❌ Failed to create print format, using standard format');
        printFormatName = 'Standard';
      }
    }
    
    // Try the print format download API
    console.log('📄 Attempting PDF download with print format:', printFormatName);
    
    // Try multiple approaches to ensure the print format is used
    let response;
    try {
      // First attempt: Use the correct 'format' parameter
      response = await axios.get(`${FRAPPE_BASE_URL}/api/method/frappe.utils.print_format.download_pdf`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          doctype: 'Rental',
          name: rentalName,
          format: printFormatName, // Use 'format' parameter as per Frappe API
          no_letterhead: 0,
          letterhead: '',
          language: 'en'
        },
        responseType: 'blob' // Important for PDF download
      });
    } catch (firstError) {
      console.log('🔄 First attempt failed, trying alternative parameter format...');
      
      try {
        // Second attempt: Try with different parameter format
        response = await axios.get(`${FRAPPE_BASE_URL}/api/method/frappe.utils.print_format.download_pdf`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            doctype: 'Rental',
            name: rentalName,
            format: printFormatName, // Use 'format' parameter
            no_letterhead: 0,
            letterhead: '',
            language: 'en'
          },
          responseType: 'blob'
        });
      } catch (secondError) {
        console.log('🔄 Second attempt failed, trying with print format in URL...');
        
        try {
          // Third attempt: Try with print format as part of the URL
          response = await axios.get(`${FRAPPE_BASE_URL}/api/method/frappe.utils.print_format.download_pdf`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              doctype: 'Rental',
              name: rentalName,
              format: printFormatName, // Use 'format' parameter
              no_letterhead: 0,
              letterhead: '',
              language: 'en'
            },
            responseType: 'blob'
          });
        } catch (thirdError) {
          console.log('🔄 Third attempt failed, trying with print format ID...');
          
          // Fourth attempt: Try using the print format ID directly
          const printFormatId = printFormatName;
          response = await axios.get(`${FRAPPE_BASE_URL}/api/method/frappe.utils.print_format.download_pdf`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              doctype: 'Rental',
              name: rentalName,
              format: printFormatId, // Use 'format' parameter
              no_letterhead: 0,
              letterhead: '',
              language: 'en'
            },
            responseType: 'blob'
          });
        }
      }
    }
    
    console.log('📄 PDF download response status:', response.status);
    console.log('📄 PDF download response headers:', response.headers);
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rental_Agreement_${rentalName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ PDF downloaded successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error downloading PDF:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
      
      // If the print format doesn't exist, try alternative approach
      if (axiosError.response?.status === 404 || axiosError.response?.status === 500) {
        console.log('🔄 Trying alternative PDF generation method...');
        return await downloadRentalPDFAlternative(accessToken, rentalName);
      }
    }
    return { success: false, error: 'Failed to download PDF' };
  }
}

async function downloadRentalPDFAlternative(accessToken: string, rentalName: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📄 Trying alternative PDF generation for rental:', rentalName);
    
    // First, let's check what print formats are available for Rental doctype
    try {
      const printFormatsResponse = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Print Format`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          filters: JSON.stringify([['doc_type', '=', 'Rental']]),
          fields: JSON.stringify(['name', 'doc_type', 'print_format_type'])
        }
      });
      console.log('📋 Available print formats for Rental:', printFormatsResponse.data);
    } catch (error) {
      console.log('Could not fetch print formats:', error);
    }
    
    // Try using the standard print format or create a custom one
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/method/frappe.utils.print_format.download_pdf`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        doctype: 'Rental',
        name: rentalName,
        format: 'Standard', // Use 'format' parameter as per Frappe API
        no_letterhead: 0,
        letterhead: '',
        language: 'en'
      },
      responseType: 'blob'
    });
    
    console.log('📄 Alternative PDF download response status:', response.status);
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rental_Agreement_${rentalName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Alternative PDF downloaded successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error downloading alternative PDF:', error);
    return { success: false, error: 'Failed to download PDF with alternative method' };
  }
}

async function createRentalAgreementPrintFormat(accessToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📝 Creating Rental Agreement print format...');
    
    const printFormatData = {
      doc_type: 'Rental',
      name: 'Rental Agreement',
      print_format_type: 'Jinja',
      standard: 'No',
      html: `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">Rental Agreement</h1>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Property Information</h2>
            <p><strong>Property:</strong> {{ doc.property_name or doc.property }}</p>
            <p><strong>Location:</strong> {{ doc.property_details.location if doc.property_details else 'N/A' }}</p>
            <p><strong>Bedrooms:</strong> {{ doc.property_details.bedrooms if doc.property_details else 'N/A' }}</p>
            <p><strong>Bathrooms:</strong> {{ doc.property_details.bathroom if doc.property_details else 'N/A' }}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Tenant Information</h2>
            <p><strong>Tenant:</strong> {{ doc.tenant_name or doc.tenant }}</p>
            <p><strong>Email:</strong> {{ doc.tenant_details.email if doc.tenant_details else 'N/A' }}</p>
            <p><strong>Phone:</strong> {{ doc.tenant_details.phone if doc.tenant_details else 'N/A' }}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Rental Terms</h2>
            <p><strong>Monthly Rent:</strong> TZS {{ "{:,.0f}".format(doc.monthly_rent_tzs or 0) }}</p>
            <p><strong>Start Date:</strong> {{ doc.start_date }}</p>
            <p><strong>End Date:</strong> {{ doc.end_date }}</p>
            <p><strong>Status:</strong> {{ doc.status }}</p>
            <p><strong>Frequency:</strong> {{ doc.frequency }} month(s)</p>
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #7f8c8d;">
            <p>This document was generated on {{ frappe.utils.nowdate() }}</p>
            <p>Rental Agreement ID: {{ doc.name }}</p>
          </div>
        </div>
      `
    };
    
    const response = await axios.post(`${FRAPPE_BASE_URL}/api/resource/Print Format`, {
      data: printFormatData
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Rental Agreement print format created successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error creating print format:', error);
    return { success: false, error: 'Failed to create print format' };
  }
}

export async function getTenants(accessToken: string): Promise<any> {
  try {
    console.log('👥 Fetching tenants with token:', accessToken);
    
    // Get users with Tenant role
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/method/frappe.client.get_list`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        doctype: 'User',
        filters: JSON.stringify([
          ['Has Role', 'role', 'in', ['System Manager', 'Tenant']]
        ]),
        fields: JSON.stringify([
          'name', 'full_name', 'email', 'phone', 'user_image', 
          'creation', 'modified', 'enabled', 'user_type'
        ]),
        limit_page_length: 1000
      }
    });
    
    console.log('👥 Tenants API response:', response.data);
    
    // Get unique users by name (primary key)
    const tenants = (response.data as any).message || [];
    const uniqueTenants = tenants.filter((tenant: any, index: number, self: any[]) => 
      index === self.findIndex((t: any) => t.name === tenant.name)
    );
    
    console.log('👥 Total tenants found:', tenants.length);
    console.log('👥 Unique tenants after deduplication:', uniqueTenants.length);
    
    return uniqueTenants;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
}

export async function createTenant(accessToken: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('👤 Creating tenant with token:', accessToken);
    console.log('Create tenant data:', data);
    
    // Prepare user data
    const userData = {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: `${data.first_name} ${data.last_name}`,
      phone: data.phone,
      user_type: 'Website User',
      enabled: 1,
      send_welcome_email: 0,
      roles: [
        {
          role: 'Tenant'
        }
      ]
    };
    
    console.log('User data to create:', userData);
    
    // Create the user
    const createResponse = await fetch(`${FRAPPE_BASE_URL}/api/resource/User`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: userData
      })
    });
    
    const createResponseData = await createResponse.json();
    console.log('Tenant creation API response:', createResponseData);
    
    if (!createResponse.ok) {
      const errorMsg = createResponseData.message || createResponseData._server_messages || 'Failed to create tenant';
      console.error('Create tenant error:', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    console.log('✅ Tenant created successfully:', createResponseData.data);
    return { success: true, data: createResponseData.data };
    
  } catch (error) {
    console.error('Error creating tenant:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function updateTenant(accessToken: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('👤 Updating tenant with token:', accessToken);
    console.log('Update tenant data:', data);
    
    // Extract name from data
    const { name, new_password, ...userData } = data;
    
    // If password is being updated, handle it separately
    if (new_password) {
      console.log('🔐 Updating password for user:', name);
      try {
        const passwordResponse = await axios.post(`${FRAPPE_BASE_URL}/api/method/frappe.client.set_value`, {
          doctype: 'User',
          name: name,
          fieldname: 'new_password',
          value: new_password
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔐 Password update response:', passwordResponse.data);
        
        if (!(passwordResponse.data as any).message) {
          console.log('✅ Password updated successfully');
        }
      } catch (passwordError) {
        console.error('❌ Error updating password:', passwordError);
        return { success: false, error: 'Failed to update password' };
      }
    }
    
    // Update other user data if provided
    if (Object.keys(userData).length > 0) {
      const response = await fetch(`${FRAPPE_BASE_URL}/api/resource/User/${name}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: userData
        })
      });
      
      const responseData = await response.json();
      console.log('Tenant update API response:', responseData);
      
      if (!response.ok) {
        const errorMsg = responseData.message || responseData._server_messages || 'Failed to update tenant';
        console.error('Update tenant error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    }
    
    return { success: true, data: null };
  } catch (error) {
    console.error('Error updating tenant:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function getNotifications(accessToken: string): Promise<any[]> {
  try {
    console.log('🔔 Fetching notifications with token:', accessToken);
    
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Notification Log`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        fields: JSON.stringify([
          'name', 'subject', 'email_content', 'type', 'read', 'creation', 
          'for_user', 'from_user', 'document_type', 'document_name'
        ]),
        filters: JSON.stringify([
          ['read', '=', 0] // Only unread notifications (checkbox unchecked)
        ]),
        limit_page_length: 50,
        order_by: 'creation desc'
      }
    });
    
    console.log('🔔 Notifications API response:', response.data);
    
    const notifications = (response.data as any).data || [];
    console.log('🔔 Number of notifications:', notifications.length);
    
    // Debug: Log the read field values
    if (notifications.length > 0) {
      console.log('🔔 Sample notification read field values:');
      notifications.slice(0, 3).forEach((notification: any, index: number) => {
        console.log(`  ${index + 1}. ${notification.name}: read = ${notification.read} (type: ${typeof notification.read})`);
      });
    }
    
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(accessToken: string, notificationName: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔔 Marking notification as read:', notificationName);
    
    // Try using Frappe's client API method first
    try {
      console.log('🔔 Attempting to set read field to 1 for checkbox...');
      const response = await axios.post(`${FRAPPE_BASE_URL}/api/method/frappe.client.set_value`, {
        doctype: 'Notification Log',
        name: notificationName,
        fieldname: 'read',
        value: 1  // This should check the checkbox
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔔 Mark as read response:', response.data);
      
      if (response.status === 200) {
        console.log('✅ Notification marked as read successfully');
        return { success: true };
      }
    } catch (setValueError) {
      console.log('⚠️ set_value method failed:', setValueError);
      console.log('⚠️ Trying alternative approach...');
    }
    
    // Alternative approach: Try using the resource API with different method
    try {
      console.log('🔔 Trying save method as fallback...');
      const response = await axios.post(`${FRAPPE_BASE_URL}/api/method/frappe.client.save`, {
        doc: {
          doctype: 'Notification Log',
          name: notificationName,
          read: 1  // Checkbox value
        }
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔔 Save method response:', response.data);
      
      if (response.status === 200) {
        console.log('✅ Notification marked as read successfully');
        return { success: true };
      }
    } catch (saveError) {
      console.log('⚠️ Save method also failed:', saveError);
    }
    
    console.error('❌ All methods failed to mark notification as read');
    return { success: false, error: 'Failed to mark notification as read' };
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function markAllNotificationsAsRead(accessToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📝 Marking all notifications as read...');
    
    // Get all unread notifications first
    const unreadNotifications = await getNotifications(accessToken);
    const unreadNames = unreadNotifications
      .filter(notification => notification.read === 0)
      .map(notification => notification.name);
    
    if (unreadNames.length === 0) {
      console.log('✅ No unread notifications to mark');
      return { success: true };
    }
    
    console.log('📋 Marking notifications as read:', unreadNames);
    
    // Mark each notification as read
    const results = await Promise.allSettled(
      unreadNames.map(name => markNotificationAsRead(accessToken, name))
    );
    
    const successCount = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    
    console.log(`✅ Successfully marked ${successCount}/${unreadNames.length} notifications as read`);
    
    return { success: successCount > 0 };
    
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    return { success: false, error: 'Failed to mark all notifications as read' };
  }
}

export async function getDashboardStats(accessToken: string): Promise<any> {
  try {
    console.log('📊 Fetching dashboard statistics...');
    
    // Fetch properties
    const properties = await getProperties(accessToken);
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter(p => p.status === 'Rented').length;
    const availableProperties = properties.filter(p => p.status === 'Available').length;
    
    // Fetch rentals
    const rentals = await getRentals(accessToken);
    const activeRentals = rentals.message?.rentals?.filter((r: any) => r.status === 'Active').length || 0;
    const totalRentals = rentals.message?.rentals?.length || 0;
    
    // Fetch payments for revenue calculation
    const payments = await getAllPayments(accessToken);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = payments
      .filter((payment: any) => {
        if (!payment.payment_date) return false;
        const paymentDate = new Date(payment.payment_date);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               payment.docstatus === 1; // Only paid payments
      })
      .reduce((sum: number, payment: any) => sum + (payment.amount_tzs || 0), 0);
    
    // Calculate pending payments
    const pendingPayments = payments.filter((payment: any) => payment.docstatus === 0).length;
    
    // For maintenance requests, we'll use a placeholder since we don't have that data yet
    const maintenanceRequests = 0; // TODO: Implement when maintenance module is available
    
    const stats = {
      total_properties: totalProperties,
      occupied_properties: occupiedProperties,
      available_properties: availableProperties,
      total_rentals: totalRentals,
      active_rentals: activeRentals,
      monthly_revenue: monthlyRevenue,
      pending_payments: pendingPayments,
      maintenance_requests: maintenanceRequests
    };
    
    console.log('📊 Dashboard stats:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    throw error;
  }
}

export async function getRecentActivities(accessToken: string): Promise<any[]> {
  try {
    console.log('📋 Fetching recent activities...');
    
    const activities: any[] = [];
    
    // Get recent payments
    const payments = await getAllPayments(accessToken);
    const recentPayments = payments
      .slice(0, 5) // Get last 5 payments
      .map((payment: any) => ({
        id: `payment-${payment.name}`,
        type: 'payment',
        title: `Payment ${payment.docstatus === 1 ? 'Received' : 'Pending'}`,
        description: `TZS ${(payment.amount_tzs || 0).toLocaleString()} for ${payment.rental || 'Rental'}`,
        timestamp: payment.payment_date || payment.creation,
        status: payment.docstatus === 1 ? 'Paid' : 'Pending'
      }));
    
    activities.push(...recentPayments);
    
    // Get recent rentals
    const rentals = await getRentals(accessToken);
    const recentRentals = (rentals.message?.rentals || [])
      .slice(0, 3) // Get last 3 rentals
      .map((rental: any) => ({
        id: `rental-${rental.name}`,
        type: 'rental',
        title: `Rental ${rental.status}`,
        description: `${rental.property_name || rental.property} - ${rental.tenant_name || rental.tenant}`,
        timestamp: rental.creation,
        status: rental.status
      }));
    
    activities.push(...recentRentals);
    
    // Get recent properties (if any new ones)
    const properties = await getProperties(accessToken);
    const recentProperties = properties
      .slice(0, 2) // Get last 2 properties
      .map((property: any) => ({
        id: `property-${property.name}`,
        type: 'property',
        title: `Property ${property.status}`,
        description: `${property.title} - ${property.location}`,
        timestamp: property.creation,
        status: property.status
      }));
    
    activities.push(...recentProperties);
    
    // Sort all activities by timestamp (most recent first)
    const sortedActivities = activities
      .filter(activity => activity.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Keep only the 10 most recent activities
    
    console.log('📋 Recent activities:', sortedActivities);
    return sortedActivities;
    
  } catch (error) {
    console.error('❌ Error fetching recent activities:', error);
    throw error;
  }
}

export async function updateUserProfile(accessToken: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('Updating user profile:', data);
    
    // Use the resource API instead of frappe.client.save for better authentication
    const response = await axios.put(`${FRAPPE_BASE_URL}/api/resource/User/${data.name}`, {
      data: {
        full_name: data.full_name,
        email: data.email,
        mobile_no: data.mobile_no,
        location: data.location,
        bio: data.bio,
      }
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    console.log('User profile update response:', response.data);
    
    const responseData = response.data as { data?: any };
    
    if (responseData && responseData.data) {
      return {
        success: true,
        data: responseData.data
      };
    } else {
      return {
        success: false,
        error: 'Failed to update user profile'
      };
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
      
      const errorData = axiosError.response?.data as { message?: string };
      
      return {
        success: false,
        error: errorData?.message || 'Failed to update user profile'
      };
    }
    
    return {
      success: false,
      error: 'Network error occurred while updating profile'
    };
  }
}

export async function changeUserPassword(accessToken: string, data: { name: string; current_password: string; new_password: string }): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Changing user password for:', data.name);
    
    const response = await axios.post(`${FRAPPE_BASE_URL}/api/method/frappe.client.change_password`, {
      old_password: data.current_password,
      new_password: data.new_password
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    console.log('Password change response:', response.data);
    
    const responseData = response.data as { message?: any };
    
    if (responseData && responseData.message) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        error: 'Failed to change password'
      };
    }
  } catch (error) {
    console.error('Error changing password:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
      
      const errorData = axiosError.response?.data as { message?: string };
      
      return {
        success: false,
        error: errorData?.message || 'Failed to change password'
      };
    }
    
    return {
      success: false,
      error: 'Network error occurred while changing password'
    };
  }
}

export async function getUserDetails(accessToken: string, userName: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('Fetching user details for:', userName);
    
    const response = await axios.get(`${FRAPPE_BASE_URL}/api/resource/User/${userName}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    console.log('User details response:', response.data);
    
    const responseData = response.data as { data?: any };
    
    if (responseData && responseData.data) {
      return {
        success: true,
        data: responseData.data
      };
    } else {
      return {
        success: false,
        error: 'Failed to fetch user details'
      };
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
      
      const errorData = axiosError.response?.data as { message?: string };
      
      return {
        success: false,
        error: errorData?.message || 'Failed to fetch user details'
      };
    }
    
    return {
      success: false,
      error: 'Network error occurred while fetching user details'
    };
  }
}
  
