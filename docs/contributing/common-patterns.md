# Common Code Patterns

A guide to common patterns used in the codebase for junior developers.

## Table of Contents

1. [API Calls](#api-calls)
2. [React Components](#react-components)
3. [State Management](#state-management)
4. [Error Handling](#error-handling)
5. [Validation](#validation)
6. [Form Handling](#form-handling)

## API Calls

### Pattern: Supabase Query

```typescript
// Standard pattern for fetching data
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)
  .single(); // For single record

if (error) {
  console.error('Error:', error);
  return null;
}

return data;
```

### Pattern: Supabase Insert

```typescript
// Inserting new record
const { data, error } = await supabase
  .from('table_name')
  .insert({
    column1: value1,
    column2: value2
  })
  .select()
  .single();

if (error) {
  throw new Error(`Failed to create: ${error.message}`);
}

return data;
```

### Pattern: Supabase Update

```typescript
// Updating existing record
const { data, error } = await supabase
  .from('table_name')
  .update({
    column1: newValue1
  })
  .eq('id', recordId)
  .select()
  .single();

if (error) {
  throw new Error(`Failed to update: ${error.message}`);
}

return data;
```

### Pattern: RPC Call

```typescript
// Calling database function
const { data, error } = await supabase
  .rpc('function_name', {
    param1: value1,
    param2: value2
  });

if (error) {
  console.error('RPC error:', error);
  return null;
}

return data;
```

## React Components

### Pattern: Component with State

```typescript
import { useState, useEffect } from 'react';

export const MyComponent = () => {
  // 1. State declarations
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Effects
  useEffect(() => {
    loadData();
  }, []);

  // 3. Functions
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Render
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* UI */}</div>;
};
```

### Pattern: Form Component

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define schema
const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
});

export const MyForm = () => {
  // 2. Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(formSchema)
  });

  // 3. Submit handler
  const onSubmit = async (data) => {
    try {
      await submitForm(data);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  // 4. Render form
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
};
```

## State Management

### Pattern: Context Provider

```typescript
import { createContext, useContext, useState } from 'react';

// 1. Create context
const MyContext = createContext(null);

// 2. Provider component
export const MyProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const value = {
    state,
    setState,
    // Other methods
  };

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
};

// 3. Custom hook
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

### Pattern: Local State with Loading

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await apiCall();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Error Handling

### Pattern: Try-Catch with User Feedback

```typescript
try {
  const result = await operation();
  toast.success('Operation successful');
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  toast.error(error.message || 'Operation failed');
  throw error;
}
```

### Pattern: Error Boundary

```typescript
// Component-level error handling
const MyComponent = () => {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div>
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={() => setError(null)}>Try again</button>
      </div>
    );
  }

  // Normal render
};
```

## Validation

### Pattern: Zod Schema

```typescript
import { z } from 'zod';

// Define schema
const userSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short'),
  age: z.number().min(18, 'Must be 18+')
});

// Validate data
const result = userSchema.safeParse(data);

if (!result.success) {
  // Handle validation errors
  result.error.errors.forEach(err => {
    console.error(`${err.path}: ${err.message}`);
  });
} else {
  // Use validated data
  const validData = result.data;
}
```

### Pattern: Custom Validation

```typescript
const validateBooking = (bookingData) => {
  const errors = [];

  if (!bookingData.date) {
    errors.push('Date is required');
  }

  if (!bookingData.time) {
    errors.push('Time is required');
  }

  if (bookingData.date < new Date()) {
    errors.push('Date cannot be in the past');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## Form Handling

### Pattern: Controlled Input

```typescript
const [formData, setFormData] = useState({
  name: '',
  email: ''
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

return (
  <input
    name="name"
    value={formData.name}
    onChange={handleChange}
  />
);
```

### Pattern: Form with Validation

```typescript
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};
  
  if (!formData.name) {
    newErrors.name = 'Name is required';
  }
  
  if (!formData.email) {
    newErrors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    newErrors.email = 'Invalid email';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();
  
  if (validate()) {
    // Submit form
  }
};
```

## Best Practices

### 1. Always Handle Errors
```typescript
// ❌ Bad
const data = await fetchData();

// ✅ Good
try {
  const data = await fetchData();
} catch (error) {
  console.error('Error:', error);
  // Handle error
}
```

### 2. Use Loading States
```typescript
// ✅ Good
if (loading) return <Spinner />;
if (error) return <ErrorMessage />;
return <DataDisplay data={data} />;
```

### 3. Validate Input
```typescript
// ✅ Good
const validated = schema.safeParse(input);
if (!validated.success) {
  return { error: validated.error };
}
```

### 4. Use TypeScript
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '123',
  name: 'John',
  email: 'john@example.com'
};
```

---

**Last Updated:** 2025-02-09
