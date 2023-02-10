# React Admin Data Provider

A data provider for [React Admin](https://marmelab.com/react-admin/) that
integrates with JamBFF APIs.

## Installation

```text
yarn add @jambff/ra-data-provider
```

## Usage

```ts
import { createDataProvider } from '@jambff/data-provider';

const dataProvider = createDataProvider('http://api.example.com');
```

## Authentication

If you need to make authenticated requests you can override the fetch client,
for example:

```ts
import { createDataProvider } from '@jambff/data-provider';
import { createClient } from '@supabase/supabase-js';
import { createAuthenticatedFetch } from '@jambff/supabase-auth-fetch';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const fetch = createAuthenticatedFetch(supabase);

const dataProvider = createDataProvider('http://api.example.com', { fetch });
```
