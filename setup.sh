#!/bin/bash

checkCopy() {
    clear
    echo -e "Getting ready..."
    mkdir -p ./logs
    echo -e "Verifying install..."
    if [ -d ./node_modules/ ] && [ -d ./data/ ]; then
        repairIntro
    else
        setupIntro
    fi
}

setupIntro() {
    clear
    echo -e "Welcome to Setup!\nThis script will help you to install and configure the bot.\nPress Ctrl-C at any time to abort the script.\n\nWhen you're done, you'll be able to launch the script again to repair the bot.\n\n"
    read -n 1 -s -r -p "Press any key to continue..."
    checkDeps
}

checkDeps() {
    clear
    echo -e "Checking Node.js version...\n\n"
    node -v | tee -a ./logs/setup.log
    if [ $? -eq 0 ]; then
        prepare
    else
        sudo apt update -y | tee -a ./logs/setup.log
        curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - && \  | tee -a ./logs/setup.log
        sudo apt-get install -y nodejs | tee -a ./logs/setup.log
        prepare
    fi
}

prepare() {
    echo -e "Installing dependencies...\n\n"
    npm install | tee -a ./logs/setup.log
    echo -e "Creating data folder...\n\n"
    mkdir -p ./data/ | tee -a ./logs/setup.log
    wizard
}

wizard() {
    clear
    echo -e "Setup will now ask you to fill in some data. You'll be able to change it later.\n\n"
    while [ -z "$name" ]; do
        read -r -p "Enter the bot's username: " name
    done
    while [ -z "$clientid" ]; do
        read -r -p "Enter the bot's client ID: " clientid
    done
    while [ -z "$token" ]; do
        read -r -p "Enter the bot's token: " token
    done
    while [ -z "$id" ]; do
        read -r -p "Enter the owner(s) Discord user id(s), separated by a comma: " id
    done
    read -r -p "Enter the bot's avatar link (leave blank for empty): " avatar
    read -r -p "Enter the bot's games, separated by a comma (leave blank for empty): " games
    echo -e "Saving preferences...\n\n" | tee -a ./logs/setup.log
    echo "NAME='${name}'" >>.env
    echo "CLIENTID=${clientid}" >>.env
    echo "TOKEN=${token}" >>.env
    echo "OWNERS='${id}'" >>.env
    echo "AVATAR=${avatar}" >>.env
    echo "ACTIVITIES='${games}'" >>.env
    telemetry_wizard
}

telemetry_wizard() {
    clear
    echo -e "Read the following notice carefully.\n\nThis bot uses telemetry to make your experience better.\n\nIf you decide to opt-out, no data will be sent to the developers of the bot.\n\nIf you decide to opt-in, we will collect the following data:\n- Error messages\n- Stack traces\n- Basic device information (CPU, RAM, OS version, Node version)\n- Performance metrics\n- Server and channel IDs for executed commands\n\n"
    options='Yes No'
    PS3="Would you like to enable telemetry? "
    select telemetry_level in $options; do
        case $REPLY in
        1)
            echo "TELEMETRY=true" >>.env
            break
            ;;
        2)
            echo "TELEMETRY=false" >>.env
            break
            ;;
        *) echo -e "Invalid input." ;;
        esac
    done
    deployment
}

deployment() {
    clear
    echo -e "Deploying commands..."
    node ./deployment.js | tee -a ./logs/setup.log
    finish
}

finish() {
    clear
    echo -e "Congratulations! You've successfully completed the Setup!\nTo start the bot, execute 'node ./index.js' in your terminal."
}

repairIntro() {
    clear
    echo -e "Welcome to Setup!\nThis script will help you to configure the bot.\nPress Ctrl-C at any time to abort the script.\n\n**Important:** Usage of some functions and commands may be restricted in some countries, such as Russia. Please host the bot in a neutral location.\n\n"
    PS3="What would you like to do? "
    options=("Update dependencies" "Re-deploy commands" "Edit username" "Edit Client ID" "Edit token" "Edit owners" "Edit avatar" "Edit games" "Edit telemetry settings" "Toggle Debug Mode" "Exit")
    select action in "${options[@]}"; do
        case $REPLY in
        1)
            clear
            echo -e "Updating dependencies..."
            npm update | tee -a ./logs/repair.log
            clear
            echo -e "Update complete."
            ;;
        2)
            clear
            echo -e "Deploying commands..."
            node ./deployment.js | tee -a ./logs/repair.log
            clear
            echo -e "Deployment complete..."
            ;;
        3)
            clear
            read -r -p "Enter the bot's new username (leave blank to cancel): " name
            if [ ! -z "$name" ]; then
                sed -i "/NAME=/d" .env
                echo "NAME='${name}'" >>.env
            fi
            clear
            ;;
        4)
            clear
            read -r -p "Enter the bot's new Client ID (leave blank to cancel): " clientid
            if [ ! -z "$clientid" ]; then
                sed -i "/CLIENTID=/d" .env
                echo "CLIENTID=${clientid}" >>.env
            fi
            clear
            ;;
        5)
            clear
            read -r -p "Enter the bot's new token (leave blank to cancel): " token
            if [ ! -z "$token" ]; then
                sed -i "/TOKEN=/d" .env
                echo "TOKEN=${token}" >>.env
            fi
            clear
            ;;
        6)
            clear
            read -r -p "Enter the bot's new owner(s) (leave blank to cancel): " id
            if [ ! -z "$id" ]; then
                sed -i "/OWNERS=/d" .env
                echo "OWNERS='${id}'" >>.env
            fi
            clear
            ;;
        7)
            clear
            read -r -p "Enter the bot's new avatar (leave blank to cancel): " avatar
            if [ ! -z "$avatar" ]; then
                sed -i "/AVATAR=/d" .env
                echo "AVATAR=${avatar}" >>.env
            fi
            clear
            ;;
        8)
            clear
            read -r -p "Enter the bot's new games (leave blank to cancel): " games
            if [ ! -z "$games" ]; then
                sed -i "/ACTIVITIES=/d" .env
                echo "ACTIVITIES='${games}'" >>.env
            fi
            clear
            ;;
        9)
            clear
            echo -e "Read the following notice carefully.\n\nThis bot uses telemetry to make your experience better.\n\nIf you decide to opt-out, no data will be sent to the developers of the bot.\n\nIf you decide to opt-in, we will collect the following data:\n- Error messages\n- Stack traces\n- Basic device information (CPU, RAM, OS version, Node version)\n- Performance metrics\n- Server and channel IDs for executed commands\n\n"
            options='Yes No'
            PS3="Would you like to enable telemetry? "
            select telemetry_level in $options; do
                case $REPLY in
                1)
                    sed -i "/TELEMETRY=/d" .env
                    echo "TELEMETRY=true" >>.env
                    clear
                    PS3="What would you like to do? "
                    break
                    ;;
                2)
                    sed -i "/TELEMETRY=/d" .env
                    echo "TELEMETRY=false" >>.env
                    clear
                    PS3="What would you like to do? "
                    break
                    ;;
                *) echo -e "Invalid input." ;;
                esac
            done
            ;;
        10)
            clear
            echo -e "Read the following notice carefully.\n\nDebug Mode is intended to be used for testing purposes only.\nIn this mode, the bot will log most actions and commands, including sensitive information.\n\nDebug Mode is not recommended for use in production. Please proceed with caution."
            options='Yes No'
            PS3="Would you like to enable Debug Mode? "
            select telemetry_level in $options; do
                case $REPLY in
                1)
                    sed -i "/DEBUG=/d" .env
                    echo "DEBUG=true" >>.env
                    clear
                    PS3="What would you like to do? "
                    break
                    ;;
                2)
                    sed -i "/DEBUG=/d" .env
                    echo "DEBUG=false" >>.env
                    clear
                    PS3="What would you like to do? "
                    break
                    ;;
                *) echo -e "Invalid input." ;;
                esac
            done
            ;;
        11)
            clear
            break
            ;;
        *) ;;
        esac
        echo -e "Bot Configuration Script\n\n"
        REPLY=
    done
}

checkCopy
