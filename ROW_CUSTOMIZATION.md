# Row Customization and Plot Categorization

This document explains the new features added to the Farm Production Record Management Application to make rows fully customizable and improve their categorization into plots.

## Overview

The application now supports:

1. **Custom Fields for Rows**: Define and manage custom fields of various types to track additional information about your rows.
2. **Row Categories**: Create and assign categories to rows for better organization and filtering.
3. **Enhanced Plot-Row Relationship**: Improved organization of rows within plots with position tracking and status management.
4. **Advanced Filtering and Sorting**: Filter rows by plot, category, and sort by various fields.

## Custom Fields System

### Features

- **Field Types**: Support for multiple field types:
  - Text: For general text information
  - Number: For numerical values
  - Date: For date information
  - Dropdown: For selecting from predefined options
  - Checkbox: For boolean values

- **Field Management**: A dedicated interface to:
  - Create new custom fields
  - Edit existing fields
  - Delete fields
  - Reorder fields
  - Set required fields

- **Field Values**: Store and retrieve custom field values for each row

### Database Structure

- `row_field_definitions`: Stores the definitions of custom fields
  - `id`: Unique identifier
  - `name`: Field name
  - `field_type`: Type of field (text, number, date, dropdown, checkbox)
  - `options`: JSON array of options for dropdown fields
  - `is_required`: Whether the field is required
  - `display_order`: Order to display fields
  - `created_at`: Creation timestamp
  - `updated_at`: Last update timestamp

- `row_field_values`: Stores the values of custom fields for each row
  - `id`: Unique identifier
  - `row_id`: Reference to the row
  - `field_id`: Reference to the field definition
  - `value`: JSON value of the field
  - `created_at`: Creation timestamp
  - `updated_at`: Last update timestamp

## Row Categories System

### Features

- **Category Management**: Create, edit, and delete row categories
- **Multiple Categories**: Assign multiple categories to each row
- **Color Coding**: Assign colors to categories for visual organization
- **Filtering**: Filter rows by category

### Database Structure

- `row_categories`: Stores row categories
  - `id`: Unique identifier
  - `name`: Category name
  - `description`: Optional description
  - `color`: Hex color code
  - `created_at`: Creation timestamp

- `row_category_assignments`: Many-to-many relationship between rows and categories
  - `id`: Unique identifier
  - `row_id`: Reference to the row
  - `category_id`: Reference to the category
  - `created_at`: Creation timestamp

## Enhanced Plot-Row Relationship

### Features

- **Row Positioning**: Track the position of rows within a plot
- **Row Status**: Track the status of rows (planned, planted, growing, harvested, removed)
- **Row Grouping**: View rows grouped by plot
- **Plot Management**: View and manage rows directly from the plot view

### Database Structure

- Added to `rows` table:
  - `position`: Integer for ordering rows within a plot
  - `status`: Text field for tracking row status

## User Interface Enhancements

### Row Form

- **Tabbed Interface**: Organize row information into tabs:
  - Basic Info: Name, plot, variety, dates, etc.
  - Categories: Assign categories to the row
  - Custom Fields: Set values for custom fields

### Rows Page

- **Advanced Filtering**: Filter rows by:
  - Plot
  - Category
  - Status
  - Custom field values

- **Sorting**: Sort rows by various fields:
  - Name
  - Status
  - Planted Date
  - Plot

- **Settings Panel**: Access to:
  - Custom Field Management
  - Row Category Management

### Plots Page

- **Row Display**: View rows associated with each plot
- **Expandable Sections**: Expand/collapse row sections for each plot
- **Quick Access**: Direct links to manage rows within a specific plot

## How to Use

### Managing Custom Fields

1. Go to the Rows page
2. Click the "Settings" button
3. In the "Custom Fields" section, click "Add Field"
4. Enter the field name, select the field type, and set other options
5. Click "Create" to add the field

### Managing Row Categories

1. Go to the Rows page
2. Click the "Settings" button
3. In the "Row Categories" section, click "Add Category"
4. Enter the category name, description, and select a color
5. Click "Create" to add the category

### Adding Custom Field Values to a Row

1. Create or edit a row
2. Go to the "Custom Fields" tab
3. Enter values for the custom fields
4. Save the row

### Assigning Categories to a Row

1. Create or edit a row
2. Go to the "Categories" tab
3. Select the categories to assign to the row
4. Save the row

### Filtering Rows

1. Go to the Rows page
2. Click the "Filters" button
3. Select a plot and/or category to filter by
4. The rows list will update to show only matching rows

### Viewing Rows in a Plot

1. Go to the Plots page
2. Find the plot you want to view
3. Click "Show Rows" to expand the rows section
4. View the rows associated with that plot

## Technical Implementation

The implementation follows a modular approach with:

1. **Database Migrations**: SQL scripts to create and update the database schema
2. **Service Layer**: TypeScript services to interact with the database
3. **Component Layer**: React components for the user interface
4. **Type Definitions**: TypeScript interfaces for type safety

## Future Enhancements

Potential future enhancements include:

1. **Drag and Drop**: Visual drag-and-drop interface for organizing rows within plots
2. **Bulk Operations**: Apply changes to multiple rows at once
3. **Advanced Search**: Full-text search across all row data including custom fields
4. **Data Visualization**: Charts and graphs based on row data and custom fields
5. **Import/Export**: Import and export row data in various formats