#!/bin/bash

end=$((SECONDS+60))

while [ $SECONDS -lt $end ]; do
   anchor run pet
   sleep 2
done