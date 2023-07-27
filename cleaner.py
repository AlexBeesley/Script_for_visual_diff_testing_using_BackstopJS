import csv

input_file = 'queued_urls.csv'
output_file = 'cleaned_urls.csv' 

with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
    
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    
    for row in reader:
        url = row[1]
        if 'localhost:44340' in url:
            writer.writerow(row)
            
print('Done cleaning CSV file.')