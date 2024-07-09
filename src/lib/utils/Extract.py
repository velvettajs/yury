from ochoa.Scrapper import scrape
from colorama import Fore, Style
from pystyle import Center, Colors, Colorate
import sys
import os

x = [
    "f",
    "F",
    "n",
    "N"
]

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def main():

    if len(sys.argv) < 5:
        print(f"Usage: {sys.argv[0]} <token> <guild_id> <channel_id> <run_badge_scraper> <client_id> " )
        sys.exit(1)

    token = sys.argv[1]
    guild_id = sys.argv[2]
    channel_id = sys.argv[3]
    run_badge_scraper = sys.argv[4]
    client_id = sys.argv[5]

    if run_badge_scraper.lower() == "y":
        run_badge_scraper = True
    elif run_badge_scraper.lower() == "n":
        run_badge_scraper = False
    else:
        print(f"Invalid value '{run_badge_scraper}' for 'run_badge_scraper'. Use 'y' or 'n'.")
        sys.exit(1)
    run_badge_scraper = bool(run_badge_scraper)

    member_data = scrape(token, guild_id, channel_id, run_badge_scraper)

    output_dir = "dist/lib/utils/ochoa/client_extrack"
    create_dir(output_dir)

    with open(f"{output_dir}/{guild_id}_{client_id}.txt", "w", encoding="utf-8") as f:
        for member in member_data.values():
            id = member['id']
            tag = member['tag']
            badges = ','.join(member.get('badges', []))
            f.write(f"ID: {id} | Username: {tag} | Badges: {badges}\n")

    print(f"{Fore.LIGHTGREEN_EX}[SUCCESS]{Style.RESET_ALL} {Fore.GREEN}Successfully scraped {len(member_data)} members from {guild_id} and saved them to scraped/{guild_id}.txt {Style.RESET_ALL}")

main()