import tkinter as tk
from tkinter import messagebox
from datetime import datetime

def calculate_airdrop():
    try:
        # Get inputs
        flares_daily = float(entry_flares_daily.get())
        total_tvl = float(entry_total_tvl.get())
        total_supply = float(entry_total_supply.get())
        tge_date_str = entry_tge_date.get()
        percent_airdropped = float(entry_percent_airdropped.get())
        
        # Parse TGE date
        tge_date = datetime.strptime(tge_date_str, '%Y-%m-%d').date()
        
        # Current date (you can hardcoded it for simulation, e.g., datetime(2025, 11, 15).date())
        current_date = datetime.today().date()  # Or use datetime(2025, 11, 15).date() for testing
        
        # Calculate days to TGE
        days_to_tge = (tge_date - current_date).days
        if days_to_tge < 0:
            raise ValueError("TGE date must be in the future.")
        
        # Total flares earned
        total_flares_earned = flares_daily * days_to_tge
        
        # Price per flare
        price_per_flare = (total_tvl * (percent_airdropped / 100)) / total_supply
        
        # Airdrop value
        airdrop_value = price_per_flare * total_flares_earned
        
        # Display result
        result_label.config(text=f"Total Flares Earned: {total_flares_earned:.2f}\n"
                                    f"Price per Flare: ${price_per_flare:.4f}\n"
                                    f"Approximate Airdrop Value: ${airdrop_value:.2f}")
    except ValueError as e:
        messagebox.showerror("Input Error", str(e))

# Create GUI window
root = tk.Tk()
root.title("Flare Airdrop Prediction Simulator")

# Labels and Entries
tk.Label(root, text="Flares Generated Daily:").grid(row=0, column=0, padx=10, pady=5)
entry_flares_daily = tk.Entry(root)
entry_flares_daily.grid(row=0, column=1)

tk.Label(root, text="Total TVL:").grid(row=1, column=0, padx=10, pady=5)
entry_total_tvl = tk.Entry(root)
entry_total_tvl.grid(row=1, column=1)

tk.Label(root, text="Total Flare Supply:").grid(row=2, column=0, padx=10, pady=5)
entry_total_supply = tk.Entry(root)
entry_total_supply.grid(row=2, column=1)

tk.Label(root, text="TGE Date (YYYY-MM-DD):").grid(row=3, column=0, padx=10, pady=5)
entry_tge_date = tk.Entry(root)
entry_tge_date.grid(row=3, column=1)

tk.Label(root, text="% of Supply Airdropped:").grid(row=4, column=0, padx=10, pady=5)
entry_percent_airdropped = tk.Entry(root)
entry_percent_airdropped.grid(row=4, column=1)

# Submit button
submit_button = tk.Button(root, text="Submit", command=calculate_airdrop)
submit_button.grid(row=5, column=0, columnspan=2, pady=10)

# Result label
result_label = tk.Label(root, text="")
result_label.grid(row=6, column=0, columnspan=2, pady=10)

root.mainloop()