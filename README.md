# Patient ID Card Printer for CARE

A React-based application for generating and printing patient ID cards directly from the CARE platform using browser print functionality.

## Overview

This application provides a browser-based print solution for patient ID cards in the CARE healthcare platform. It allows healthcare workers to generate professional ID cards with patient details, photos, and QR codes for quick identification and record access.

## Features

- **Browser Print**: Print patient ID cards directly using the browser's native print dialog
- **Patient Search**: Search for patients by name, phone number, or external ID
- **QR Code Integration**: Automatic QR code generation for quick patient lookup
- **Fixed Layout**: Standardized ID card layout (customizable layouts planned for future releases)

## Where to Find This Feature in CARE

You can access the ID card printing feature from the following locations in the CARE platform:

1. **Patient Profile Page**:
   - Navigate to any patient's profile
   - Click on the "Print ID Card" button in the patient actions menu

2. **Patient Home/Dashboard**:
   - Located in the patient home actions wrapper
   - Available as a quick action for printing ID cards

3. **Searchpage via route**:
   - /facility/{facilityId}/printid

## Setup

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ohcnetwork/care_pretty_print_fe.git
cd care_pretty_print_fe
```

2. Install dependencies:

```bash
pnpm install
```

## Running the Application

### Development Mode

Start the development server:

```bash
pnpm run start
```

The application will be available at `http://localhost:10120` (or the port shown in your terminal).

## Registering the App in CARE

After running the application locally, you need to register it as a plugin in the CARE admin dashboard to access it from within CARE:

1. Open your CARE instance in the browser and log in as an administrator.
2. Navigate to the **Admin Dashboard**.
3. Click on **Apps** in the sidebar.
4. Click on **CARE Pretty Print** view details
5. Click on Start setup, and follow on-screen instructions.
6. Once registered, the ID card printing feature will be available in the locations mentioned above (Patient Profile, Patient Home, and via the route `/facility/{facilityId}/printid`).

> **Note**: For production deployments, replace `http://localhost:10120` with your production URL.

## Current Layout

The ID card layout is currently **fixed** with a standardized design that includes:

- Patient name and details
- Age, gender
- QR code for quick scanning

### Future Enhancements

- **Customizable Layouts**: In future releases, we plan to add support for customizable ID card templates that can be configured per facility or use case
- **Multiple card sizes**: Support for different card dimensions
- **Theme customization**: Allow facilities to customize colors and branding