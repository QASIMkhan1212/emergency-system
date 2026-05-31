from typing import Dict, List, Optional


class DispatchNode:
    def __init__(self, record: Dict):
        self.record = record
        self.next = None


class DispatchLogLinkedList:
    def __init__(self):
        self.head = None

    def push(self, record: Dict):
        node = DispatchNode(record)
        node.next = self.head
        self.head = node

    def to_list(self) -> List[Dict]:
        result = []
        current = self.head
        while current:
            result.append(current.record)
            current = current.next
        return result

    def latest(self) -> Optional[Dict]:
        return self.head.record if self.head else None
