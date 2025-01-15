import os
import base64
import ipaddress
import json
import multiprocessing
import random
from io import BytesIO
from socket import AF_INET, SOCK_STREAM, socket
from typing import List, Optional, Union

import requests
from PIL import Image

from .logger import CustomLogger

def mkdirIfNotExists(dir: str):
  if not os.path.exists(dir):
    os.makedirs(dir)
  
def is_port_free(host: str, port: int) -> bool:
    """Check if a given port on a host is free.

    :param host: The host to check.
    :param port: The port to check.
    :return: True if the port is free, False otherwise.
    """
    with socket(AF_INET, SOCK_STREAM) as session:
        return session.connect_ex((host, port)) != 0


def check_ports_availability(host: Union[str, List[str]], port: Union[int, List[int]]) -> bool:
    """Check if one or more ports on one or more hosts are free.

    :param host: The host(s) to check.
    :param port: The port(s) to check.
    :return: True if all ports on all hosts are free, False otherwise.
    """
    hosts = [host] if isinstance(host, str) else host
    ports = [port] if isinstance(port, int) else port

    return all(is_port_free(h, p) for h in hosts for p in ports)