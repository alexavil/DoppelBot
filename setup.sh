#!/bin/bash

checkCopy() {
    clear
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
    node -v | tee -a setup.log
    if [ $? -eq 0 ]; then
        prepare
    else
        sudo apt update -y | tee -a setup.log
        curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - && \  | tee -a setup.log
        sudo apt-get install -y nodejs | tee -a setup.log
        prepare
    fi
}

prepare() {
    echo -e "Installing dependencies...\n\n"
    npm install | tee -a setup.log
    echo -e "Creating data folder...\n\n"
    mkdir -p ./data/ | tee -a setup.log
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
    echo -e "Saving preferences...\n\n" | tee -a setup.log
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
    echo -e "Read the following notice carefully.\n\nThis bot uses telemetry to make your experience better.\n\nYou have 3 options for telemetry: None, Minimal and Full.\n\nIf you select None, no data will be sent to the developers of the bot.\n\nIf you select Minimal, we will collect the following data:\n- Error messages\n- Stack traces\n- Basic device information (CPU, RAM, OS version, Node version)\n\nIf you select Full, we will also collect:\n- Performance metrics\n- Server and channel IDs for executed commands\n\n"
    options='None Minimal Full'
    PS3="What level of telemetry would you like to use? "
    select telemetry_level in $options; do
        case $REPLY in
        1)
            echo "TELEMETRY=none" >>.env
            break
            ;;
        2)
            echo "TELEMETRY=minimal" >>.env
            break
            ;;
        3)
            echo "TELEMETRY=full" >>.env
            break
            ;;
        *) echo -e "Invalid input. Please select a valid telemetry level." ;;
        esac
    done
    deployment
}

deployment() {
    clear
    echo -e "Deploying commands..."
    node ./deployment.js | tee -a setup.log
    finish
}

finish() {
    clear
    echo -e "Congratulations! You've successfully completed the Setup!\nTo start the bot, execute 'node ./index.js' in your terminal."
}

repairIntro() {
    clear
    echo -e "Welcome to Setup!\nThis script will help you to configure the bot.\nPress Ctrl-C at any time to abort the script.\n\n"
    PS3="What would you like to do? "
    options=("Update the dependencies" "Re-deploy commands" "Edit the name" "Edit the Client ID" "Edit the token" "Edit the owners" "Edit the avatar" "Edit the games" "Edit telemetry settings" "Exit")
    select action in "${options[@]}"; do
        case $REPLY in
        1)
            clear
            echo -e "Updating dependencies..."
            npm update | tee -a repair.log
            clear
            echo -e "Update complete."
            ;;
        2)
            clear
            echo -e "Deploying commands..."
            node ./deployment.js | tee -a repair.log
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
            echo -e "Read the following notice carefully.\n\nThis bot uses telemetry to make your experience better.\n\nYou have 3 options for telemetry: None, Minimal and Full.\n\nIf you select None, no data will be sent to the developers of the bot.\n\nIf you select Minimal, we will collect the following data:\n- Error messages\n- Stack traces\n- Basic device information (CPU, RAM, OS version, Node version)\n\nIf you select Full, we will also collect:\n- Performance metrics\n- Server and channel IDs for executed commands\n\n"
            options='None Minimal Full'
            PS3="What level of telemetry would you like to use? "
            select telemetry_level in $options; do
                case $REPLY in
                1)
                    sed -i "/TELEMETRY=/d" .env
                    echo "TELEMETRY=none" >>.env
                    clear
                    PS3="What would you like to do? "
                    break
                    ;;
                2)
                    sed -i "/TELEMETRY=/d" .env
                    echo "TELEMETRY=minimal" >>.env
                    clear
                    PS3="What would you like to do? "
                    break
                    ;;
                3)
                    sed -i "/TELEMETRY=/d" .env
                    echo "TELEMETRY=full" >>.env
                    clear
                    PS3="What would you like to do? "
                    break
                    ;;
                *) echo -e "Invalid input. Please select a valid telemetry level." ;;
                esac
            done
            ;;
        10) clear ; break ;;
        *) ;;
        esac
        echo -e "Bot Configuration Script\n\n"
        REPLY=
    done
}

checkCopy
