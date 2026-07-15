# Queensland Traffic Site Analyser

A web application that analyses Queensland Government traffic data and allows users to search traffic monitoring sites across the state.

## Features

- Search by road name, location or site ID
- Case-insensitive searching
- Typo-tolerant location matching (allows spelling errors :)
- Identifies each site's busiest day
- Identifies each site's busiest hour
- Compares average weekday and weekend traffic
- Responsive dark-mode interface

## Dependencies

- Python
- pandas
- Node.js
- HTML
- CSS
- JavaScript

## How It Works

1. Python and pandas read the Queensland traffic CSV dataset.
2. Traffic records are grouped and analysed by monitoring site.
3. The processed results are saved as JSON.
4. A lightweight Node.js server displays the results through the website.

## Run the Project Locally

Create and activate a Python virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1

install pandas:
python -m pip install -r requirements.txt

generate the analysed traffic results:
python python/analyse.py

start the node.js server:
npm start

lastly, open this address:
http://localhost:(WHATEVER NUMBER POPS UP FOR YOU)