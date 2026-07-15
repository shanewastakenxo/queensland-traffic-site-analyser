from pathlib import Path
import json

import pandas as pd


# Locate the main project folder.
PROJECT_FOLDER = Path(__file__).resolve().parent.parent

CSV_FILE = PROJECT_FOLDER / "data" / "traffic-data.csv"
OUTPUT_FILE = PROJECT_FOLDER / "public" / "results.json"

DAY_COLUMNS = [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
]


def analyse_all_sites(data: pd.DataFrame) -> list[dict]:
    """
    Analyse every traffic monitoring site.

    Returns a list containing one result dictionary for each site.
    """

    site_results = []

    # Make sure all traffic-volume columns contain numbers.
    data[DAY_COLUMNS] = (
        data[DAY_COLUMNS]
        .apply(pd.to_numeric, errors="coerce")
        .fillna(0)
    )

    # Separate the dataset by SITE_ID.
    for site_id, site_data in data.groupby("SITE_ID", sort=True):

        # Add all hours and both traffic directions together.
        daily_totals = site_data[DAY_COLUMNS].sum()

        busiest_day = str(daily_totals.idxmax())
        busiest_day_volume = int(round(daily_totals.max()))

        # Find the average traffic for every hourly period.
        hourly_average = site_data[DAY_COLUMNS].mean(axis=1)

        hourly_totals = (
            site_data.assign(
                HOURLY_WEEK_AVERAGE=hourly_average
            )
            .groupby(
                "HOUR",
                sort=False
            )["HOURLY_WEEK_AVERAGE"]
            .sum()
        )

        busiest_hour = str(hourly_totals.idxmax())
        busiest_hour_volume = int(round(hourly_totals.max()))

        # Find typical weekday and weekend daily volumes.
        weekday_average = int(
            round(
                daily_totals[
                    ["MON", "TUE", "WED", "THU", "FRI"]
                ].mean()
            )
        )

        weekend_average = int(
            round(
                daily_totals[
                    ["SAT", "SUN"]
                ].mean()
            )
        )

        result = {
            "siteId": int(site_id),
            "roadName": str(site_data["ROAD_NAME"].iloc[0]),
            "description": str(site_data["DESCRIPTION"].iloc[0]),
            "busiestDay": busiest_day,
            "busiestDayVolume": busiest_day_volume,
            "busiestHour": busiest_hour,
            "busiestHourVolume": busiest_hour_volume,
            "weekdayAverage": weekday_average,
            "weekendAverage": weekend_average,
        }

        site_results.append(result)

    return site_results


def main() -> None:
    """Load the traffic CSV, analyse it and save the results."""

    try:
        traffic_data = pd.read_csv(CSV_FILE)

    except FileNotFoundError:
        print("ERROR: The CSV file could not be found.")
        print(f"Expected location: {CSV_FILE}")
        return

    except pd.errors.ParserError:
        print("ERROR: The CSV file could not be read.")
        return

    print(f"Loaded {len(traffic_data):,} traffic records.")

    results = analyse_all_sites(traffic_data)

    # Create the public folder if it does not already exist.
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_FILE.open(
        mode="w",
        encoding="utf-8"
    ) as output:
        json.dump(
            results,
            output,
            indent=2,
            ensure_ascii=False
        )

    print(f"Analysed {len(results):,} traffic sites.")
    print(f"Results saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()