
import csv
import random
import os

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
    temp_file = file_path + ".tmp"
    with open(file_path, 'r', encoding='utf-8') as fin, \
         open(temp_file, 'w', encoding='utf-8', newline='') as fout:
        
        reader = csv.DictReader(fin)
        fieldnames = reader.fieldnames
        writer = csv.DictWriter(fout, fieldnames=fieldnames)
        writer.writeheader()
        
        for row in reader:
            item = random.choice(pune_data)
            locality = item["locality"]
            pincode = item["pincode"]
            
            row['city'] = "Pune"
            # If location exists as a separate column, update it too
            if 'location' in row:
                row['location'] = locality
            row['pincode'] = pincode
            row['address'] = generate_street_address(locality)
            writer.writerow(row)
            
    os.replace(temp_file, file_path)
    print("Update complete via csv module!")

if __name__ == "__main__":
    update_workers_csv("data/syn_workers.csv")
