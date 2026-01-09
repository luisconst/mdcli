# mdcli

Unofficial CLI client for [Meu Dinheiro](https://meudinheiroweb.com.br) - a Brazilian personal finance app.

## Installation

### Global (npm/bun)

```bash
bun install -g github:fm1randa/mdcli
# or
npm install -g github:fm1randa/mdcli
```

### From Source

```bash
gh repo clone fm1randa/mdcli
cd mdcli
bun install
bun dev --help
```

## Usage

```bash
# Authenticate (opens browser to capture session)
mdcli auth login

# List accounts
mdcli accounts list --active

# Create an alias for quick access
mdcli accounts alias add --id 1167419 --name mp

# List entries using alias
mdcli entries list --account mp --from 2024-01-01 --to 2024-01-31

# Create an entry
mdcli entries create --account mp --description "Groceries" --value 150 --category food
```

## Features

### Auth
| Feature | Status |
|---------|--------|
| Browser login (auto-capture) | Done |
| Manual token entry | Done |
| Status check | Done |
| Logout | Missing |

### Accounts
| Feature | Status |
|---------|--------|
| List | Done |
| Filter by active | Done |
| JSON output | Done |
| Aliases (add/list/rm/update) | Done |
| Create | Missing |
| Update | Missing |
| Delete | Missing |
| Archive | Missing |

### Categories
| Feature | Status |
|---------|--------|
| List | Done |
| Filter by active | Done |
| Filter by type | Missing |
| JSON output | Done |
| Aliases (add/list/rm/update) | Done |
| Create | Missing |
| Update | Missing |
| Delete | Missing |
| Archive | Missing |

### Tags
| Feature | Status |
|---------|--------|
| List | Done |
| Filter by active | Done |
| JSON output | Done |
| Aliases (add/list/rm/update) | Done |
| Create | Missing |
| Update | Missing |
| Delete | Missing |
| Archive | Missing |

### Entries
| Feature | Status |
|---------|--------|
| List by account | Done |
| Filter by date range | Done |
| Filter by status | Done |
| Filter by type | Done |
| Filter by category | Done |
| Filter by tag | Done |
| Filter by keywords | Done |
| Filter by value | Done |
| JSON output | Done |
| Alias support (account/category/tag) | Done |
| Create (single) | Done |
| Create (recurring) | Done |
| Update | Missing |
| Delete | Missing |
| Reconcile | Missing |
| Confirm | Missing |
