#!/bin/bash

end=$((SECONDS+60))

while [ $SECONDS -lt $end ]; do
   anchor run pet
   anchor run pet
   anchor run bonk
done