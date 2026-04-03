
import pandas as pd
import random

# Real Pune Localities and Pincodes
pune_data = [
    {"locality": "Aundh", "pincode": "411007"},
    {"locality": "Baner", "pincode": "411045"},
    {"locality": "Bavdhan", "pincode": "411021"},
    {"locality": "Camp", "pincode": "411001"},
    {"locality": "Deccan Gymkhana", "pincode": "411004"},
    {"locality": "Hadapsar", "pincode": "411028"},
    {"locality": "Karve Nagar", "pincode": "411052"},
    {"locality": "Kharadi", "pincode": "411014"},
    {"locality": "Kondhwa", "pincode": "411048"},
    {"locality": "Kothrud", "pincode": "411038"},
    {"locality": "Magarpatta City", "pincode": "411013"},
    {"locality": "Pashan", "pincode": "411008"},
    {"locality": "Pimple Saudagar", "pincode": "411027"},
    {"locality": "Shivajinagar", "pincode": "411005"},
    {"locality": "Viman Nagar", "pincode": "411014"},
    {"locality": "Wakad", "pincode": "411057"},
    {"locality": "Yerwada", "pincode": "411006"},
    {"locality": "Balewadi", "pincode": "411045"},
    {"locality": "Hinjewadi", "pincode": "411057"},
    {"locality": "Katraj", "pincode": "411046"},
    {"locality": "Bibwewadi", "pincode": "411037"},
    {"locality": "Vishrantwadi", "pincode": "411015"},
    {"locality": "Wadgaon Sheri", "pincode": "411014"},
    {"locality": "Mundhwa", "pincode": "411036"},
    {"locality": "Kalyani Nagar", "pincode": "411006"},
    {"locality": "Dhankawadi", "pincode": "411043"},
    {"locality": "Warje", "pincode": "411058"},
    {"locality": "Ambegaon", "pincode": "411046"},
    {"locality": "Sangvi", "pincode": "411027"},
    {"locality": "Pimpri", "pincode": "411018"}
]

street_prefixes = ["Flat", "House No.", "Bunglow", "Plot No."]
street_names = ["Main Road", "Station Road", "Park View", "Market Lane", "Green Avenue", "High Street", "River Bank", "Hill Side"]

def generate_street_address(locality):
    prefix = random.choice(street_prefixes)
    num = random.randint(1, 999)
    street = random.choice(street_names)
    return f"{prefix} {num}, {street}, {locality}"

def update_workers_csv(file_path):
    df = pd.read_csv(file_path)
    print(f"Updating {len(df)} workers...")
    
    for i in range(len(df)):
        item = random.choice(pune_data)
        locality = item["locality"]
        pincode = item["pincode"]
        
        df.at[i, 'city'] = "Pune"
        df.at[i, 'location'] = locality # Some columns might use location instead of city
        df.at[i, 'pincode'] = pincode
        df.at[i, 'address'] = generate_street_address(locality)
        
    df.to_csv(file_path, index=False)
    print("Update complete!")

if __name__ == "__main__":
    update_workers_csv("data/syn_workers.csv")
