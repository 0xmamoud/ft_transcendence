
#!/bin/bash

VENV_DIR="django_venv"

echo "Creating virtual environment..."
python3 -m venv "$VENV_DIR"

echo "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

if [ $? -eq 0 ]; then
    echo "Installing dependencies..."
    pip install -r requirement.txt

    echo "Listing installed packages..."
    pip list

else
    echo "Failed to activate virtual environment. Exiting..."
    exit 1
fi

